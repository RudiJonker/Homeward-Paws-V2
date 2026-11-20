import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Button,Field,Screen,styles as s} from '../ui';
import {useAuth} from '../auth';
import {supabase} from '../supabase';
import {colors} from '../theme';

const VERIFY_REDIRECT='homewardpaws://auth/verify';

export default function VerifyEmail(){
  const params=useLocalSearchParams();
  const routeEmail=Array.isArray(params.email)?params.email[0]:params.email;
  const {pendingVerificationEmail,setPendingVerificationEmail}=useAuth();
  const email=(routeEmail||pendingVerificationEmail||'').trim().toLowerCase();
  const [code,setCode]=useState('');
  const [message,setMessage]=useState('');
  const [success,setSuccess]=useState(false);
  const [busy,setBusy]=useState(false);
  const [seconds,setSeconds]=useState(60);

  useEffect(()=>{
    if(seconds<=0)return;
    const timer=setTimeout(()=>setSeconds(current=>Math.max(0,current-1)),1000);
    return()=>clearTimeout(timer);
  },[seconds]);

  async function verify(){
    const token=code.replace(/\D/g,'');
    setSuccess(false);
    if(!email)return setMessage('Return to signup and enter your email address again.');
    if(!/^\d{8}$/.test(token))return setMessage('Enter the complete 8-digit code from your email.');
    setBusy(true);setMessage('');
    const {error}=await supabase.auth.verifyOtp({email,token,type:'email'});
    if(error){setBusy(false);return setMessage(error.message)}
    await setPendingVerificationEmail('');
    setSuccess(true);setMessage('Email verified. Preparing your profile...');
    setBusy(false);
    router.replace('/complete-profile');
  }

  async function resend(){
    if(!email)return setMessage('Return to signup and enter your email address again.');
    if(seconds>0||busy)return;
    setBusy(true);setSuccess(false);setMessage('');
    const {error}=await supabase.auth.resend({type:'signup',email,options:{emailRedirectTo:VERIFY_REDIRECT}});
    setBusy(false);setSeconds(60);
    if(error)return setMessage(error.message);
    setSuccess(true);setMessage('A new verification code has been sent.');
  }

  async function useDifferentEmail(){
    await setPendingVerificationEmail('');
    router.replace('/signup');
  }

  return <Screen title="Verify your email" lead={`Enter the 8-digit code emailed to ${email||'your email address'}.`}>
    <Field label="Verification code" value={code} onChangeText={value=>setCode(value.replace(/\D/g,''))} keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} placeholder="Enter code"/>
    {message?<Text style={[s.body,{color:success?colors.primary:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Please wait...':'Verify email'} disabled={busy} onPress={verify}/>
    <Button title={seconds>0?`Send a new code in ${seconds}s`:'Send a new code'} kind="secondary" disabled={busy||seconds>0} onPress={resend}/>
    <Button title="Use a different email" kind="secondary" disabled={busy} onPress={useDifferentEmail}/>
    <Button title="Back to login" kind="secondary" disabled={busy} onPress={()=>router.replace('/login')}/>
  </Screen>;
}
