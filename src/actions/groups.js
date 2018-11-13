// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import {GroupTypes} from 'action_types';
import {General, Groups} from 'constants';

import {Client4} from 'client';

import {logError} from './errors';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';
import {batchActions} from 'redux-batched-actions';

import type {ActionFunc} from '../types/actions';

export function linkGroupSyncable(groupID: string, syncableID: string, syncableType: SyncableType, patch: SyncablePatch): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: GroupTypes.LINK_GROUP_SYNCABLE_REQUEST, data: {groupID, syncableID, type: syncableType}});

        let data;
        try {
            data = await Client4.linkGroupSyncable(groupID, syncableID, syncableType, patch);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: GroupTypes.LINK_GROUP_SYNCABLE_FAILURE, error, data: {groupID, syncableID, type: syncableType}},
                logError(error),
            ]));
            return {error};
        }

        var type;
        switch (syncableType) {
        case Groups.SYNCABLE_TYPE_TEAM:
            type = GroupTypes.LINKED_GROUP_TEAM;
            break;
        case Groups.SYNCABLE_TYPE_CHANNEL:
            type = GroupTypes.LINKED_GROUP_CHANNEL;
            break;
        default:
            console.warn(`unhandled syncable type ${syncableType}`); // eslint-disable-line no-console
        }

        dispatch(batchActions([
            {type: GroupTypes.LINK_GROUP_SYNCABLE_SUCCESS, data: null},
            {type, data},
        ]));

        return {data: true};
    };
}

export function unlinkGroupSyncable(groupID: string, syncableID: string, syncableType: SyncableType): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: GroupTypes.UNLINK_GROUP_SYNCABLE_REQUEST, data: {groupID, syncableID, type: syncableType}});

        try {
            await Client4.unlinkGroupSyncable(groupID, syncableID, syncableType);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: GroupTypes.UNLINK_GROUP_SYNCABLE_FAILURE, error, data: {groupID, syncableID, type: syncableType}},
                logError(error),
            ]));
            return {error};
        }

        var type;
        var data = {group_id: groupID};
        switch (syncableType) {
        case Groups.SYNCABLE_TYPE_TEAM:
            type = GroupTypes.UNLINKED_GROUP_TEAM;
            data.team_id = syncableID;
            break;
        case Groups.SYNCABLE_TYPE_CHANNEL:
            type = GroupTypes.UNLINKED_GROUP_CHANNEL;
            data.channel_id = syncableID;
            break;
        default:
            console.warn(`unhandled syncable type ${syncableType}`); // eslint-disable-line no-console
        }

        dispatch(batchActions([
            {type: GroupTypes.UNLINK_GROUP_SYNCABLE_SUCCESS, data: null},
            {type, data},
        ]));

        return {data: true};
    };
}

export function getGroupSyncables(groupID: string, syncableType: SyncableType): ActionFunc {
    switch (syncableType) {
    case Groups.SYNCABLE_TYPE_TEAM:
        return bindClientFunc(
            Client4.getGroupSyncables,
            GroupTypes.GET_GROUP_SYNCABLES_REQUEST,
            [GroupTypes.RECEIVED_GROUP_TEAMS, GroupTypes.GET_GROUP_SYNCABLES_SUCCESS],
            GroupTypes.GET_GROUP_SYNCABLES_FAILURE,
            groupID,
            syncableType,
        );
    case Groups.SYNCABLE_TYPE_CHANNEL:
        return bindClientFunc(
            Client4.getGroupSyncables,
            GroupTypes.GET_GROUP_SYNCABLES_REQUEST,
            [GroupTypes.RECEIVED_GROUP_CHANNELS, GroupTypes.GET_GROUP_SYNCABLES_SUCCESS],
            GroupTypes.GET_GROUP_SYNCABLES_FAILURE,
            groupID,
            syncableType,
        );
    default:
        console.warn(`unhandled syncable type ${syncableType}`); // eslint-disable-line no-console
    }
    return null;
}

export function getGroupMembers(groupID: string, page: number = 0, perPage: number = General.LOGS_PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc(
        Client4.getGroupMembers,
        GroupTypes.GET_GROUP_MEMBERS_REQUEST,
        [GroupTypes.RECEIVED_GROUP_MEMBERS, GroupTypes.GET_GROUP_MEMBERS_SUCCESS],
        GroupTypes.GET_GROUP_MEMBERS_FAILURE,
        groupID,
        page,
        perPage
    );
}

export function getGroup(id: string): ActionFunc {
    return bindClientFunc(
        Client4.getGroup,
        GroupTypes.GET_GROUP_REQUEST,
        [GroupTypes.RECEIVED_GROUP, GroupTypes.GET_GROUP_SUCCESS],
        GroupTypes.GET_GROUP_FAILURE,
        id,
    );
}
