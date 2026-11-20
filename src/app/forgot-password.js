import {useState} from 'react';
import {Alert,Text} from 'react-native';
import {router} from 'expo-router';
import {Button,Field,PasswordField,Screen,styles as s} from '../ui';
import {supabase} from '../supabase';
import {colors} from '../theme';

const RESET_REDIRECT='homewardpaws://auth/reset';

export default function ForgotPassword(){
  const [stage,setStage]=useState('email');
  const [email,setEmail]=useState('');
  const [code,setCode]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const normalizedEmail=email.trim().toLowerCase();

  async function sendCode(){
    if(!normalizedEmail.includes('@'))return setMessage('Enter a valid email address.');
    setBusy(true);setMessage('');
    const {error}=await supabase.auth.resetPasswordForEmail(normalizedEmail,{redirectTo:RESET_REDIRECT});
    setBusy(false);
    if(error)return setMessage(error.message);
    setStage('code');
    setMessage('Check your email for the password reset code.');
  }

  async function verifyCode(){
    const token=code.replace(/\s/g,'');
    if(token.length<6)return setMessage('Enter the complete verification code from your email.');
    setBusy(true);setMessage('');
    const {error}=await supabase.auth.verifyOtp({email:normalizedEmail,token,type:'recovery'});
    setBusy(false);
    if(error)return setMessage(error.message);
    setStage('password');
    setMessage('Code confirmed. Choose your new password.');
  }

  async function savePassword(){
    if(password.length<8)return setMessage('Use at least 8 characters for your password.');
    if(password!==confirm)return setMessage('Passwords do not match.');
    setBusy(true);setMessage('');
    const {error}=await supabase.auth.updateUser({password});
    if(error){setBusy(false);return setMessage(error.message)}
    const {error:signOutError}=await supabase.auth.signOut();
    setBusy(false);
    if(signOutError)return setMessage(`Password changed, but sign out failed: ${signOutError.message}`);
    Alert.alert('Password changed','Your password was updated successfully. Log in with your new password.',[
      {text:'Log in',onPress:()=>router.replace('/login')},
    ]);
  }

  return <Screen
    title="Reset your password"
    lead={stage==='email'?'Enter the email address used for your Homeward Paws account.':stage==='code'?'Enter the code sent to your email address.':'Choose a new password for your account.'}
  >
    {stage==='email'?<>
      <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email"/>
      {message?<Message value={message}/>:null}
      <Button title={busy?'Sending code…':'Send reset code'} disabled={busy} onPress={sendCode}/>
    </>:null}

    {stage==='code'?<>
      <Text style={s.body}>{normalizedEmail}</Text>
      <Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" autoCapitalize="none" autoComplete="one-time-code" maxLength={8}/>
      {message?<Message value={message}/>:null}
      <Button title={busy?'Checking code…':'Verify code'} disabled={busy} onPress={verifyCode}/>
      <Button title="Send a new code" kind="secondary" disabled={busy} onPress={sendCode}/>
    </>:null}

    {stage==='password'?<>
      <PasswordField label="New password" value={password} onChangeText={setPassword} autoComplete="new-password"/>
      <PasswordField label="Confirm new password" value={confirm} onChangeText={setConfirm} autoComplete="new-password"/>
      {message?<Message value={message}/>:null}
      <Button title={busy?'Saving password…':'Save new password'} disabled={busy} onPress={savePassword}/>
    </>:null}
  </Screen>;
}

function Message({value}){
  const helpful=value.startsWith('Check your email')||value.startsWith('Code confirmed');
  return <Text style={[s.body,{color:helpful?colors.primary:colors.error}]}>{value}</Text>;
}
