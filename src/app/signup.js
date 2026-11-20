import {useState} from 'react';
import {Text} from 'react-native';
import {router} from 'expo-router';
import {Screen,Button,Field,PasswordField,styles as s} from '../ui';
import {supabase} from '../supabase';
import {useAuth} from '../auth';
import {colors} from '../theme';

export default function Signup(){
  const {setPendingVerificationEmail}=useAuth();
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function submit(){
    const normalized=email.trim().toLowerCase();
    if(!normalized.includes('@'))return setMessage('Enter a valid email address.');
    if(password.length<8)return setMessage('Use at least 8 characters for your password.');
    if(password!==confirm)return setMessage('Passwords do not match.');
    setBusy(true);setMessage('');
    const {data,error}=await supabase.auth.signUp({email:normalized,password});
    setBusy(false);
    if(error)return setMessage(error.message);
    if(!data.session){
      await setPendingVerificationEmail(normalized);
      return router.replace({pathname:'/verify-email',params:{email:normalized}});
    }
    router.replace('/complete-profile');
  }
  return <Screen title="Create your account" lead="Join your community and help missing animals get home.">
    <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email"/>
    <PasswordField label="Password" value={password} onChangeText={setPassword} autoComplete="new-password"/>
    <PasswordField label="Confirm password" value={confirm} onChangeText={setConfirm} autoComplete="new-password"/>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Creating account…':'Create account'} disabled={busy} onPress={submit}/>
  </Screen>;
}
