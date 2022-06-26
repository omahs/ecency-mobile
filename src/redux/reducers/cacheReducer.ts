import { PURGE_EXPIRED_CACHE, UPDATE_VOTE_CACHE, UPDATE_COMMENT_CACHE, DELETE_COMMENT_CACHE_ENTRY, DELETE_DRAFT_CACHE_ENTRY, UPDATE_DRAFT_CACHE, UPDATE_COMMUNITIES_CACHE, DELETE_COMMUNITIES_CACHE, SET_COMMUNITIES_CACHE, SET_SUBSCRIBING_COMMUNITY, SET_FETCHING_SUBSCRIBED_COMMUNITIES, SET_DISCOVER_COMMUNITIES_CACHE, SET_FETCHING_DISCOVER_COMMUNITIES, UPDATE_DISCOVER_COMMUNITIES_CACHE,  } from "../constants/constants";

export interface Vote {
    amount:number;
    isDownvote:boolean;
    incrementStep:number;
    votedAt:number; 
    expiresAt:number;
}

export interface Comment {
    author:string,
    permlink:string,
    parent_author:string,
    parent_permlink:string,
    body?:string,
    markdownBody:string,
    author_reputation?:number,
    total_payout?:number,
    net_rshares?:number,
    active_votes?:Array<{rshares:number, voter:string}>,
    json_metadata?:any,
    isDeletable?:boolean,
    created?:string, //handle created and updated separatly
    updated?:string,
    expiresAt?:number,
}

export interface Draft {
    author: string,
    body:string,
    title?:string,
    tags?:string,
    created?:number,
    updated?:number,
    expiresAt?:number;
}

export interface Community {
    communityId:string;
    title:string;
    role?:string;
    label?:string; 
    isSubscribed: boolean;
}
export interface CommunityCacheObject {
    subscribedCommunities?: Array<Community>,
    discoverCommunities?: Array<any>,
    fetchingSubscribedCommunities?: boolean,
    fetchingDiscoverCommunities?: boolean,
    subscribingCommunity?: boolean
}

interface State {
    votes:Map<string, Vote>
    comments:Map<string, Comment> //TODO: handle comment array per post, if parent is same
    drafts: Map<string, Draft>
    communities: CommunityCacheObject
    lastUpdate:{
        postPath:string,
        updatedAt:number,
        type:'vote'|'comment'|'draft'|'communities',
    }
}

const initialState:State = {
    votes:new Map(),
    comments:new Map(),
    drafts: new Map(),
    communities: {
        subscribedCommunities: [],
        fetchingSubscribedCommunities: true,
        discoverCommunities: [],
        fetchingDiscoverCommunities: true,
        subscribingCommunity: false
    },
    lastUpdate:null,
  };
  
  export default function (state = initialState, action) {
      const {type, payload} = action;
    switch (type) {
        case UPDATE_VOTE_CACHE:
            if(!state.votes){
                state.votes = new Map<string, Vote>();
            }
            state.votes.set(payload.postPath, payload.vote);
            return {
                ...state, //spread operator in requried here, otherwise persist do not register change
                lastUpdate:{
                    postPath:payload.postPath,
                    updatedAt: new Date().getTime(),
                    type:'vote',
                }
            };
        
        case UPDATE_COMMENT_CACHE:
            if(!state.comments){
                state.comments = new Map<string, Comment>();
            }
            state.comments.set(payload.commentPath, payload.comment);
            return {
                ...state, //spread operator in requried here, otherwise persist do not register change
                lastUpdate:{
                    postPath:payload.commentPath,
                    updatedAt: new Date().getTime(),
                    type:'comment'
                }
            };

        case DELETE_COMMENT_CACHE_ENTRY:
            if(state.comments && state.comments.has(payload)){
                state.comments.delete(payload);
            }
            return { ...state }
            
        case UPDATE_DRAFT_CACHE:
            if(!state.drafts){
                state.drafts = new Map<string, Draft>();
            }

            const curTime = new Date().getTime();
            const curDraft = state.drafts.get(payload.id);
            const payloadDraft = payload.draft;

            payloadDraft.created = curDraft ? curDraft.created : curTime;
            payloadDraft.updated = curTime;
            payloadDraft.expiresAt = curTime + 604800000 // 7 days ms

            state.drafts.set(payload.id, payloadDraft);
            return {
              ...state, //spread operator in requried here, otherwise persist do not register change
              lastUpdate: {
                postPath: payload.id,
                updatedAt: new Date().getTime(),
                type: 'draft',
              },
            };

        case DELETE_DRAFT_CACHE_ENTRY:
            if (state.drafts && state.drafts.has(payload)) {
                state.drafts.delete(payload);
            }
            return { ...state }

        case SET_COMMUNITIES_CACHE:
             
            return {
                ...state,
                communities: {
                    ...state.communities,
                    subscribedCommunities: payload,
                    fetchingSubscribedCommunities: false,
                },
            }
        
        case DELETE_COMMUNITIES_CACHE:
            return {
                ...state,
                communities: {
                    subscribedCommunities: [],
                    discoverCommunities: [],
                    fetchingSubscribedCommunities: false,
                    fetchingDiscoverCommunities: false,
                    subscribingCommunity: false,
                },
            }

        case UPDATE_COMMUNITIES_CACHE:
            const isItemExist = state.communities.subscribedCommunities.find((item) => item.communityId === payload.communityId); 
            const updatedCommunitiesList = isItemExist
              ? state.communities.subscribedCommunities.map((item) => {
                  if (payload.communityId === item.communityId) {
                    return payload;
                  } else {
                    return item;
                  }
                })
              : [...state.communities.subscribedCommunities, payload];
            return {
                ...state,
                communities: {
                    ...state.communities,
                    subscribedCommunities: updatedCommunitiesList,
                    subscribingCommunity: false,
                }
            }
 
        case SET_FETCHING_SUBSCRIBED_COMMUNITIES: 
            return {
              ...state,
              communities: {
                ...state.communities,
                fetchingSubscribedCommunities: payload,
              },
            };

        case SET_DISCOVER_COMMUNITIES_CACHE:
            if(payload && payload.length > 0){
                payload.forEach((community) =>
                  Object.assign(community, {
                    isSubscribed: state.communities.subscribedCommunities.some(
                      (subscribedCommunity) =>
                        subscribedCommunity.communityId === community.name &&
                        subscribedCommunity.isSubscribed,
                    ),
                  }),
                );
                payload.sort((a, b) => a.title.localeCompare(b.title));
            }
    
            return {
              ...state,
              communities: {
                ...state.communities,
                discoverCommunities: payload,
                fetchingDiscoverCommunities: false,
              },
            };

        case UPDATE_DISCOVER_COMMUNITIES_CACHE:
            const updatedDiscoversList = state.communities.discoverCommunities.map((community) => {
              let subItem = state.communities.subscribedCommunities.find(
                (subscribedCommunity) => subscribedCommunity.communityId === community.name,
              );
              if (subItem) {
                return {
                  ...community,
                  isSubscribed: subItem.isSubscribed,
                };
              } else {
                return community;
              }
            });
              return {
                ...state,
                communities: {
                  ...state.communities,
                  discoverCommunities: updatedDiscoversList,
                },
              };
        case SET_FETCHING_DISCOVER_COMMUNITIES: 
            return {
              ...state,
              communities: {
                ...state.communities,
                fetchingDiscoverCommunities: payload,
              },
            };

        case SET_SUBSCRIBING_COMMUNITY: 
            return {
                ...state,
                communities: {
                    ...state.communities,
                    subscribingCommunity: payload,
                }
            }

        case PURGE_EXPIRED_CACHE:
            const currentTime = new Date().getTime();

            if(state.votes && state.votes.size){
                Array.from(state.votes).forEach((entry)=>{
                   if(entry[1].expiresAt < currentTime){
                       state.votes.delete(entry[0]);
                   }
                })
            }

            if(state.comments && state.comments.size){
                Array.from(state.comments).forEach((entry)=>{
                    if(entry[1].expiresAt < currentTime){
                        state.comments.delete(entry[0]);
                    }
                 })
            }

            if(state.drafts && state.drafts.size){
                Array.from(state.drafts).forEach((entry)=>{
                    if(entry[1].expiresAt < currentTime){
                        state.drafts.delete(entry[0]);
                    }
                 })
            }
            
            return {
                ...state
            }
        default:
          return state;
      }
    }

