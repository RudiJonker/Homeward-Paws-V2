import {useState} from 'react';
import {Alert,Image,Switch,Text,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Button,Field,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import {supabase} from '../../supabase';
import {uploadImage} from '../../uploads';
import {colors} from '../../theme';
import LocationFields from '../../components/LocationFields';
import {formatGeneralLocation,splitGeneralLocation} from '../../location';

export default function Animal(){
  const {id}=useLocalSearchParams();
  const {animals,saveAnimal,removeAnimal}=useStore();
  const {session,profile}=useAuth();
  const old=animals.find(animal=>animal.id===id);
  const ownerLocation=splitGeneralLocation(profile);
  const savedLocation=old?.province||old?.city||old?.suburb?{province:old.province,city:old.city,suburb:old.suburb}:splitGeneralLocation({home_area:old?.area});
  const [name,setName]=useState(old?.name||''),[type,setType]=useState(old?.type||''),[description,setDescription]=useState(old?.description||'');
  const [useOwnerLocation,setUseOwnerLocation]=useState(old?old.useOwnerLocation===true:true),[location,setLocation]=useState(old?savedLocation:ownerLocation);
  const [photo,setPhoto]=useState(old?.photo||require('../../../assets/animal-dog.png')),[newPhoto,setNewPhoto]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function pick(){const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[4,3],quality:.8,base64:true});if(!result.canceled){setPhoto({uri:result.assets[0].uri});setNewPhoto({...result.assets[0],mimeType:'image/jpeg'});setMessage('')}}
  async function save(){
    if(busy)return;
    const selectedLocation=useOwnerLocation?ownerLocation:location;
    if(!name.trim()||!type.trim())return setMessage('Name and animal type are required.');
    if(!selectedLocation.province.trim()||!selectedLocation.city.trim()||!selectedLocation.suburb.trim())return setMessage('Province, city and suburb are required.');
    setBusy(true);setMessage('');
    let uploadedPath=null;
    try{
      let photoPath=old?.photoPath||null;
      if(newPhoto){photoPath=`${session.user.id}/${old?.id||`new-${Date.now()}`}.jpg`;await uploadImage('animal-photos',photoPath,newPhoto);uploadedPath=photoPath}
      await saveAnimal({id:old?.id||'new',name,type,description,area:formatGeneralLocation(selectedLocation),location:selectedLocation,useOwnerLocation,photoPath});
      Alert.alert('Animal saved',`${name.trim()} has been saved to your profile.`,[{text:'View Profile',onPress:()=>router.replace('/profile')}]);
    }catch(error){
      if(uploadedPath&&!old)await supabase.storage.from('animal-photos').remove([uploadedPath]);
      setMessage(error.message);
    }finally{setBusy(false)}
  }
  function confirmRemove(){Alert.alert(`Remove ${old.name}?`,'This permanently removes the animal profile and its stored photo.',[{text:'Cancel',style:'cancel'},{text:'Remove',style:'destructive',onPress:async()=>{if(busy)return;setBusy(true);try{await removeAnimal(old);router.replace('/home')}catch(error){setMessage(error.message);setBusy(false)}}}])}
  if(!session)return <Screen title="Sign in required"><Button title="Log in" onPress={()=>router.replace('/login')}/></Screen>;
  return <Screen title={old?`Edit ${old.name}`:'Add an animal'} lead="Saved details make urgent reporting faster.">
    <Image source={photo} style={s.photo}/>
    <Button title="Choose photo (optional)" kind="secondary" icon="camera" onPress={pick}/>
    <Field label="Name" value={name} onChangeText={setName}/>
    <Field label="Animal type" value={type} onChangeText={setType} placeholder="Dog, cat, bird…"/>
    <Field label="Short description" value={description} onChangeText={setDescription} multiline/>
    <View style={s.row}>
      <View style={{flex:1,gap:4}}><Text style={s.h2}>Home location</Text><Text style={s.muted}>Same as owner profile location</Text></View>
      <Switch value={useOwnerLocation} onValueChange={setUseOwnerLocation} trackColor={{false:colors.border,true:colors.primary}} thumbColor="white"/>
    </View>
    {useOwnerLocation?<Text style={s.body}>{formatGeneralLocation(ownerLocation)||'Complete your owner profile location first.'}</Text>:<LocationFields title="Animal home location" value={location} onChange={setLocation}/>}
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Saving…':'Save animal'} disabled={busy} onPress={save}/>
    {old?<Button title="Remove animal" kind="danger" disabled={busy} onPress={confirmRemove}/>:null}
  </Screen>;
}
