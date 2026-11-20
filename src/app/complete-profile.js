import {useEffect,useState} from 'react';
import {Alert,Image,Text} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {router} from 'expo-router';
import {Screen,Button,Field,styles as s} from '../ui';
import {useAuth} from '../auth';
import {supabase} from '../supabase';
import {uploadImage} from '../uploads';
import {formatMobile,isSouthAfricanMobile,mobileDigits} from '../mobile';
import LocationFields from '../components/LocationFields';
import {formatGeneralLocation,splitGeneralLocation} from '../location';
import {colors} from '../theme';

export default function CompleteProfile(){
  const {session,profile,refreshProfile,pendingAction,setPendingAction}=useAuth();
  const [name,setName]=useState(profile?.display_name||'');
  const [mobile,setMobile]=useState(formatMobile(profile?.mobile||''));
  const [location,setLocation]=useState(()=>splitGeneralLocation(profile));
  const [photo,setPhoto]=useState(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if(profile){setName(profile.display_name||'');setMobile(formatMobile(profile.mobile||''));setLocation(splitGeneralLocation(profile))}},[profile]);
  async function pick(){const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[1,1],quality:.8,base64:true});if(!result.canceled)setPhoto({...result.assets[0],mimeType:'image/jpeg'})}
  async function save(){
    if(busy)return;
    if(!name.trim())return setMessage('Display name is required.');
    if(!isSouthAfricanMobile(mobile))return setMessage('Enter a valid South African mobile number, for example 082 123 4567.');
    if(!location.province.trim()||!location.city.trim()||!location.suburb.trim())return setMessage('Province, city or town, and suburb are required.');
    const isEditing=Boolean(profile?.profile_completed);
    setBusy(true);setMessage('');
    try{
      let avatarPath=profile?.avatar_path||null;
      if(photo){avatarPath=`${session.user.id}/avatar.jpg`;await uploadImage('avatars',avatarPath,photo)}
      const {error}=await supabase.from('profiles').update({
        display_name:name.trim(),mobile:mobileDigits(mobile),
        home_province:location.province.trim(),home_city:location.city.trim(),home_suburb:location.suburb.trim(),
        home_area:formatGeneralLocation(location),avatar_path:avatarPath,profile_completed:true,
      }).eq('id',session.user.id);
      if(error)throw error;
      await refreshProfile(session.user.id);
      const target=pendingAction?.route||'/home';
      const destination=pendingAction?.draft?{pathname:target,params:pendingAction.draft}:target;
      await setPendingAction(null);
      if(isEditing){
        Alert.alert(
          'Profile saved',
          'Your profile details have been updated.',
          [{text:'Back to Home',onPress:()=>router.replace('/home')}],
          {cancelable:false},
        );
      }else{
        router.replace(destination);
      }
    }catch(error){setMessage(error.message)}finally{setBusy(false)}
  }
  if(!session)return null;
  return <Screen title={profile?.profile_completed?'Edit profile':'Complete your profile'} lead="Contact details stay private. Report-specific WhatsApp contact is always a separate choice.">
    {photo?<Image source={{uri:photo.uri}} style={[s.photo,{height:140}]}/>:null}
    <Button title="Choose profile photo (optional)" kind="secondary" onPress={pick}/>
    <Field label="Display name" value={name} onChangeText={setName}/>
    <Field label="South African mobile number" value={mobile} onChangeText={value=>setMobile(formatMobile(value))} keyboardType="phone-pad" maxLength={12} placeholder="082 123 4567"/>
    <LocationFields value={location} onChange={setLocation}/>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Saving…':'Save profile'} disabled={busy} onPress={save}/>
  </Screen>;
}
