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

export default function ReportFound(){
  const {session,profile}=useAuth(),{publishFound}=useStore();
  const [photo,setPhoto]=useState(null),[typeChoice,setTypeChoice]=useState(''),[otherType,setOtherType]=useState('');
  const [description,setDescription]=useState(''),[details,setDetails]=useState(''),[foundAt,setFoundAt]=useState(new Date());
  const [location,setLocation]=useState(splitGeneralLocation(profile)),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function pick(){
    const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,quality:.8,base64:true});
    if(!result.canceled){setPhoto({...result.assets[0],mimeType:result.assets[0].mimeType||'image/jpeg'});setMessage('')}
  }
  async function submit(){
    if(!session)return router.push('/login');
    const type=typeChoice==='Other'?otherType.trim():typeChoice;
    if(!photo)return setMessage('Add a clear photo of the found animal.');
    if(!type)return setMessage('Select the animal type.');
    if(!description.trim())return setMessage('Add a short description or identifiable features.');
    if(!location.province.trim()||!location.city.trim()||!location.suburb.trim())return setMessage('Province, city and suburb are required.');
    setBusy(true);setMessage('');let photoPath;
    try{
      photoPath=`${session.user.id}/found-${Date.now()}.jpg`;
      await uploadImage('animal-photos',photoPath,photo);
      const reference=await publishFound({type,description:description.trim(),details:details.trim(),foundAt:foundAt.toISOString(),location,photoPath});
      Alert.alert('Found report published','The report is now visible under Browse → Found.',[{text:'View report',onPress:()=>router.replace(`/found/${reference}`)}]);
    }catch(error){if(photoPath)await supabase.storage.from('animal-photos').remove([photoPath]);setMessage(error.message);setBusy(false)}
  }
  const complete=photo&&typeChoice&&(typeChoice!=='Other'||otherType.trim())&&description.trim()&&location.province.trim()&&location.city.trim()&&location.suburb.trim();
  return <Screen title="Report a found animal" lead="Use this when the animal is currently safe or in your care.">
    <Text style={s.muted}>Before publishing, check Browse → Missing where possible. If you recognise an existing animal, open that alert and choose “I found this animal” instead.</Text>
    {photo?<Image source={{uri:photo.uri}} style={s.photo}/>:null}
    <Button title={photo?'Change photo':'Add photo'} kind="secondary" icon="camera" onPress={pick}/>
    <View style={{gap:8}}><Text style={s.label}>Animal type</Text><Pills value={typeChoice} onChange={setTypeChoice}/></View>
    {typeChoice==='Other'?<Field label="Other animal type" value={otherType} onChangeText={setOtherType}/>:null}
    <Field label="Description and identifiable features" value={description} onChangeText={setDescription} multiline placeholder="Colour, size, collar, markings or condition"/>
    <LocationFields title="Where the animal was found" value={location} onChange={setLocation}/>
    <Field label="Additional location information (optional)" value={details} onChangeText={setDetails} multiline placeholder="Landmark or where the animal is currently safe"/>
    <DateTimeFields label="Date and time found" value={foundAt} onChange={setFoundAt}/>
    <Text style={s.muted}>Only the general location is public. Your mobile number is never displayed on the report.</Text>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Publishing...':'Publish Found report'} icon="home-search-outline" disabled={busy||!complete} onPress={submit}/>
  </Screen>;
}

const local=StyleSheet.create({
  pills:{flexDirection:'row',flexWrap:'wrap',gap:8},pill:{paddingHorizontal:14,paddingVertical:9,borderRadius:radius.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},pillSelected:{borderColor:colors.primary,backgroundColor:colors.primaryLight},pillTextSelected:{color:colors.primary,fontFamily:'Nunito_700Bold'},
});
