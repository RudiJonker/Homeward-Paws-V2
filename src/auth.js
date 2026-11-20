import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {supabase} from './supabase';

const C=createContext(null),PENDING='hpv2:pending-action',PENDING_EMAIL='hpv2:pending-verification-email';

export function AuthProvider({children}){
  const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[loading,setLoading]=useState(true),[pendingAction,setPendingState]=useState(null),[pendingVerificationEmail,setPendingEmailState]=useState('');
  const activeUserId=useRef(null);
  const refreshProfile=useCallback(async userId=>{
    if(!supabase||!userId){setProfile(null);return null}
    const {data,error}=await supabase.from('profiles').select('*').eq('id',userId).maybeSingle();
    if(error)throw error;
    if(activeUserId.current===userId)setProfile(data);
    return data;
  },[]);
  useEffect(()=>{
    let live=true;
    Promise.all([supabase.auth.getSession(),AsyncStorage.getItem(PENDING),AsyncStorage.getItem(PENDING_EMAIL)]).then(async([{data},saved,savedEmail])=>{
      if(!live)return;
      const next=data.session;
      activeUserId.current=next?.user.id||null;
      setSession(next);setProfile(null);
      if(saved)try{setPendingState(JSON.parse(saved))}catch{}
      if(savedEmail)setPendingEmailState(savedEmail);
      if(next)try{await refreshProfile(next.user.id)}catch{}
      if(live)setLoading(false);
    });
    const {data}=supabase.auth.onAuthStateChange((_event,next)=>{
      const userId=next?.user.id||null;
      activeUserId.current=userId;
      setSession(next);setProfile(null);
      if(userId)setTimeout(()=>refreshProfile(userId).catch(()=>{}),0);
    });
    return()=>{live=false;data.subscription.unsubscribe()};
  },[refreshProfile]);
  const setPendingAction=useCallback(async value=>{
    setPendingState(value);
    if(value)await AsyncStorage.setItem(PENDING,JSON.stringify(value));
    else await AsyncStorage.removeItem(PENDING);
  },[]);
  const setPendingVerificationEmail=useCallback(async value=>{
    const normalized=value?.trim().toLowerCase()||'';
    setPendingEmailState(normalized);
    if(normalized)await AsyncStorage.setItem(PENDING_EMAIL,normalized);
    else await AsyncStorage.removeItem(PENDING_EMAIL);
  },[]);
  const signOut=useCallback(async()=>{
    activeUserId.current=null;setProfile(null);setPendingState(null);
    await AsyncStorage.removeItem(PENDING);
    const {error}=await supabase.auth.signOut();
    if(error)throw error;
  },[]);
  const value=useMemo(()=>({session,profile,loading,refreshProfile,pendingAction,setPendingAction,pendingVerificationEmail,setPendingVerificationEmail,signOut}),[session,profile,loading,refreshProfile,pendingAction,setPendingAction,pendingVerificationEmail,setPendingVerificationEmail,signOut]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useAuth(){return useContext(C)}
