import {useState} from 'react';
import {Text} from 'react-native';
import {router} from 'expo-router';
import {Screen,Button,Field,PasswordField,styles as s} from '../ui';
import {supabase} from '../supabase';
import {useAuth} from '../auth';
import {colors} from '../theme';

export default function Login(){
  const {pendingAction,setPendingAction}=useAuth();
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function submit(){
    setBusy(true);setMessage('');
    const {data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
    if(error){setBusy(false);return setMessage(error.message)}
    const {data:p,error:profileError}=await supabase.from('profiles').select('profile_completed').eq('id',data.user.id).maybeSingle();
    if(profileError){setBusy(false);return setMessage(`Signed in, but the profile could not be loaded: ${profileError.message}`)}
    const target=p?.profile_completed?(pendingAction?.route||'/home'):'/complete-profile';
    if(p?.profile_completed)await setPendingAction(null);
    setBusy(false);router.replace(target);
  }
  return <Screen title="Welcome back" lead="Log in to manage your animals and missing alerts.">
    <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email"/>
    <PasswordField label="Password" value={password} onChangeText={setPassword} autoComplete="current-password"/>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Logging in…':'Log in'} disabled={busy} onPress={submit}/>
  </Screen>;
}
