// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {GroupTypes} from 'action_types';

function syncables(state = {}, action) {
    switch (action.type) {
    case GroupTypes.RECEIVED_GROUP_TEAMS: {
        return {
            ...state,
            [action.group_id]: {
                ...state[action.group_id],
                teams: action.data,
            },
        };
    }
    case GroupTypes.RECEIVED_GROUP_CHANNELS: {
        return {
            ...state,
            [action.group_id]: {
                ...state[action.group_id],
                channels: action.data,
            },
        };
    }
    case GroupTypes.LINKED_GROUP_TEAM: {
        const nextTeams = {...state}[action.data.group_id].teams;

        for (let i = 0, len = nextTeams.length; i < len; i++) {
            if (nextTeams[i].team_id === action.data.team_id) {
                nextTeams[i] = action.data;
            }
        }

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                teams: nextTeams,
            },
        };
    }
    case GroupTypes.LINKED_GROUP_CHANNEL: {
        const nextChannels = {...state}[action.data.group_id].channels;

        for (let i = 0, len = nextChannels.length; i < len; i++) {
            if (nextChannels[i].channel_id === action.data.channel_id) {
                nextChannels[i] = action.data;
            }
        }

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                channels: nextChannels,
            },
        };
    }
    case GroupTypes.UNLINKED_GROUP_TEAM: {
        const nextTeams = {...state}[action.data.group_id].teams;

        const index = nextTeams.findIndex((groupTeam) => {
            return groupTeam.team_id === action.data.team_id;
        });

        nextTeams.splice(index, 1);

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                teams: nextTeams,
            },
        };
    }
    case GroupTypes.UNLINKED_GROUP_CHANNEL: {
        const nextChannels = {...state}[action.data.group_id].channels;

        const index = nextChannels.findIndex((groupChannel) => {
            return groupChannel.channel_id === action.data.channel_id;
        });

        nextChannels.splice(index, 1);

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                channels: nextChannels,
            },
        };
    }
    default:
        return state;
    }
}

function members(state = {}, action) {
    switch (action.type) {
    case GroupTypes.RECEIVED_GROUP_MEMBERS: {
        return {
            ...state,
            [action.group_id]: {
                members: action.data.members,
                totalMemberCount: action.data.total_member_count,
            },
        };
    }
    default:
        return state;
    }
}

function groups(state = {}, action) {
    switch (action.type) {
    case GroupTypes.RECEIVED_GROUP: {
        return {
            ...state,
            [action.data.id]: action.data,
        };
    }
    default:
        return state;
    }
}

export default combineReducers({
    syncables,
    members,
    groups,
});
