import {useState} from 'react';
import {Alert,Image,Pressable,StyleSheet,Text,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {router} from 'expo-router';
import {Screen,Button,Field,styles as s} from '../ui';
import {useAuth} from '../auth';
import {useStore} from '../store';
import {supabase} from '../supabase';
import {uploadImage} from '../uploads';
import {splitGeneralLocation} from '../location';
import LocationFields from '../components/LocationFields';
import DateTimeFields from '../components/DateTimeFields';
import {colors,radius} from '../theme';

const TYPES=['Dog','Cat','Bird','Farm Animal','Horse','Other'];
function Pills({value,onChange}){return <View style={local.pills}>{TYPES.map(option=><Pressable key={option} onPress={()=>onChange(option)} style={[local.pill,value===option&&local.pillSelected]}><Text style={[s.body,value===option&&local.pillTextSelected]}>{option}</Text></Pressable>)}</View>}

export default function ReportSighted(){
  const {session,profile}=useAuth(),{publishSighted}=useStore();
  const [photo,setPhoto]=useState(null),[typeChoice,setTypeChoice]=useState(''),[otherType,setOtherType]=useState('');
  const [description,setDescription]=useState(''),[details,setDetails]=useState(''),[sightedAt,setSightedAt]=useState(new Date());
  const [location,setLocation]=useState(splitGeneralLocation(profile)),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function pick(){const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,quality:.8,base64:true});if(!result.canceled){setPhoto({...result.assets[0],mimeType:result.assets[0].mimeType||'image/jpeg'});setMessage('')}}
  async function submit(){
    if(!session)return router.push('/login');
    const type=typeChoice==='Other'?otherType.trim():typeChoice;
    if(!type)return setMessage('Select the animal type.');
    if(!description.trim())return setMessage('Add a short description or identifiable features.');
    if(!location.province.trim()||!location.city.trim()||!location.suburb.trim())return setMessage('Province, city and suburb are required.');
    setBusy(true);setMessage('');let photoPath;
    try{
      if(photo){photoPath=`${session.user.id}/sighted-${Date.now()}.jpg`;await uploadImage('animal-photos',photoPath,photo)}
      const reference=await publishSighted({type,description:description.trim(),details:details.trim(),sightedAt:sightedAt.toISOString(),location,photoPath:photoPath||null});
      Alert.alert('Sighting published','The report is now visible under Browse → Sighted.',[{text:'View report',onPress:()=>router.replace(`/sighted/${reference}`)}]);
    }catch(error){if(photoPath)await supabase.storage.from('animal-photos').remove([photoPath]);setMessage(error.message);setBusy(false)}
  }
  const complete=typeChoice&&(typeChoice!=='Other'||otherType.trim())&&description.trim()&&location.province.trim()&&location.city.trim()&&location.suburb.trim();
  return <Screen title="Report an animal sighting" lead="Use this when the animal is roaming and is not in your care.">
    <Text style={s.muted}>If you recognise an existing Missing alert, open it and choose “I saw this animal” instead. Add only a general location here.</Text>
    {photo?<Image source={{uri:photo.uri}} style={s.photo}/>:null}
    <Button title={photo?'Change photo':'Add photo (optional)'} kind="secondary" icon="camera" onPress={pick}/>
    <View style={{gap:8}}><Text style={s.label}>Animal type</Text><Pills value={typeChoice} onChange={setTypeChoice}/></View>
    {typeChoice==='Other'?<Field label="Other animal type" value={otherType} onChangeText={setOtherType}/>:null}
    <Field label="Description and identifiable features" value={description} onChangeText={setDescription} multiline placeholder="Colour, size, collar, markings or condition"/>
    <LocationFields title="Where the animal was sighted" value={location} onChange={setLocation}/>
    <Field label="Additional information (optional)" value={details} onChangeText={setDetails} multiline placeholder="Landmark, direction of travel or behaviour"/>
    <DateTimeFields label="Date and time sighted" value={sightedAt} onChange={setSightedAt}/>
    <Text style={s.muted}>Do not follow an animal into an unsafe area. Exact coordinates and your mobile number are not displayed publicly.</Text>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Publishing...':'Publish Sighted report'} icon="eye-outline" disabled={busy||!complete} onPress={submit}/>
  </Screen>;
}

const local=StyleSheet.create({pills:{flexDirection:'row',flexWrap:'wrap',gap:8},pill:{paddingHorizontal:14,paddingVertical:9,borderRadius:radius.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},pillSelected:{borderColor:colors.primary,backgroundColor:colors.primaryLight},pillTextSelected:{color:colors.primary,fontFamily:'Nunito_700Bold'}});
