import {useState} from 'react';
import {Alert,Image,Pressable,StyleSheet,Switch,Text,View} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Button,Field,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import {supabase} from '../../supabase';
import {uploadImage} from '../../uploads';
import {colors,radius,spacing} from '../../theme';
import LocationFields from '../../components/LocationFields';
import {formatGeneralLocation,splitGeneralLocation} from '../../location';

const TYPES=['Dog','Cat','Bird','Farm Animal','Horse','Other'];
const COLOURS=['Black','White','Brown','Tan','Grey','Ginger','Cream','Golden'];

function Pills({options,value,onChange,multiple=false}){
  return <View style={local.pills}>{options.map(option=>{const selected=multiple?value.includes(option):value===option;return <Pressable key={option} onPress={()=>onChange(multiple?(selected?value.filter(item=>item!==option):[...value,option]):option)} style={[local.pill,selected&&local.pillSelected]}><Text style={[s.body,local.pillText,selected&&local.pillTextSelected]}>{option}</Text></Pressable>})}</View>;
}

export default function Animal(){
  const {id}=useLocalSearchParams(),{animals,saveAnimal,removeAnimal}=useStore(),{session,profile}=useAuth();
  const old=animals.find(animal=>animal.id===id),ownerLocation=splitGeneralLocation(profile);
  const savedLocation=old?.province||old?.city||old?.suburb?{province:old.province,city:old.city,suburb:old.suburb}:splitGeneralLocation({home_area:old?.area});
  const knownType=TYPES.includes(old?.type)?old?.type:(old?.type?'Other':'');
  const initialPhotos=(old?.photos||[]).map(item=>({key:item.path,path:item.path,source:item.source}));
  const [name,setName]=useState(old?.name||''),[typeChoice,setTypeChoice]=useState(knownType),[otherType,setOtherType]=useState(knownType==='Other'?old.type:'');
  const [breed,setBreed]=useState(old?.breed||''),[colours,setColours]=useState(old?.colours||[]),[sex,setSex]=useState(old?.sex||''),[age,setAge]=useState(old?.age||''),[ageUnit,setAgeUnit]=useState(old?.ageUnit||''),[features,setFeatures]=useState(old?.features||old?.description||'');
  const [hasMedical,setHasMedical]=useState(old?.hasMedical||false),[medical,setMedical]=useState(old?.medical||''),[chipped,setChipped]=useState(old?.chipped||false),[approach,setApproach]=useState(old?.approach||'');
  const [useOwnerLocation,setUseOwnerLocation]=useState(old?old.useOwnerLocation===true:true),[location,setLocation]=useState(old?savedLocation:ownerLocation);
  const [photos,setPhotos]=useState(initialPhotos),[mainKey,setMainKey]=useState(old?.photoPath||initialPhotos[0]?.key||null);
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);

  async function pick(){
    const remaining=3-photos.length;if(remaining<=0)return;
    const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsMultipleSelection:true,selectionLimit:remaining,orderedSelection:true,quality:.8,base64:true});
    if(result.canceled)return;
    const stamp=Date.now(),added=result.assets.slice(0,remaining).map((asset,index)=>({key:`new-${stamp}-${index}`,source:{uri:asset.uri},asset:{...asset,mimeType:asset.mimeType||'image/jpeg'}}));
    setPhotos(current=>[...current,...added]);if(!mainKey&&added[0])setMainKey(added[0].key);setMessage('');
  }
  function removePhoto(key){const next=photos.filter(item=>item.key!==key);setPhotos(next);if(mainKey===key)setMainKey(next[0]?.key||null)}
  function movePhoto(index,direction){const target=index+direction;if(target<0||target>=photos.length)return;const next=[...photos],[item]=next.splice(index,1);next.splice(target,0,item);setPhotos(next)}
  async function save(){
    if(busy)return;
    const selectedLocation=useOwnerLocation?ownerLocation:location,type=typeChoice==='Other'?otherType.trim():typeChoice;
    if(!name.trim()||!type)return setMessage('Name and animal type are required.');
    if(!sex)return setMessage('Select the animal’s sex.');
    const ageNumber=Number(age.replace(',','.'));
    if(!age.trim()||!Number.isFinite(ageNumber)||ageNumber<=0)return setMessage('Enter a valid approximate age.');
    if(!ageUnit)return setMessage('Select Months or Years for the approximate age.');
    if(!colours.length)return setMessage('Select at least one colour.');
    if(!approach)return setMessage('Choose whether the animal is safe to approach or requires caution.');
    if(hasMedical&&!medical.trim())return setMessage('Add the animal’s medical requirements.');
    if(!selectedLocation.province.trim()||!selectedLocation.city.trim()||!selectedLocation.suburb.trim())return setMessage('Province, city and suburb are required.');
    setBusy(true);setMessage('');const uploaded=[];
    try{
      const savedPhotos=[];
      for(let index=0;index<photos.length;index++){
        const item=photos[index];let path=item.path;
        if(item.asset){path=`${session.user.id}/${old?.id||`new-${Date.now()}`}-${Date.now()}-${index}.jpg`;await uploadImage('animal-photos',path,item.asset);uploaded.push(path)}
        savedPhotos.push({...item,path});
      }
      const main=savedPhotos.find(item=>item.key===mainKey)||savedPhotos[0];
      await saveAnimal({id:old?.id||'new',name,type,description:features,breed,colours,sex,age:String(ageNumber),ageUnit,features,hasMedical,medical,chipped,approach,area:formatGeneralLocation(selectedLocation),location:selectedLocation,useOwnerLocation,photoPath:main?.path||null,photoPaths:savedPhotos.map(item=>item.path)});
      Alert.alert('Animal saved',`${name.trim()} has been saved to your profile.`,[{text:'View Profile',onPress:()=>router.replace('/profile')}]);
    }catch(error){if(uploaded.length)await supabase.storage.from('animal-photos').remove(uploaded);setMessage(error.message)}finally{setBusy(false)}
  }
  function confirmRemove(){Alert.alert(`Remove ${old.name}?`,'This permanently removes the animal profile and its stored photos.',[{text:'Cancel',style:'cancel'},{text:'Remove',style:'destructive',onPress:async()=>{if(busy)return;setBusy(true);try{await removeAnimal(old);router.replace('/profile')}catch(error){setMessage(error.message);setBusy(false)}}}])}
  if(!session)return <Screen title="Sign in required"><Button title="Log in" onPress={()=>router.replace('/login')}/></Screen>;
  return <Screen title={old?`Edit ${old.name}`:'Add an animal'} lead="Save the essentials now so an urgent report is quick later.">
    <View style={{gap:8}}><Text style={s.h2}>Photos</Text><Text style={s.muted}>Add up to 3 photos. Choose one as the main public photo and use the arrows to change their order.</Text></View>
    <View style={local.photos}>{photos.map((item,index)=><View key={item.key} style={local.photoCard}><Image source={item.source} style={local.photo}/><Pressable onPress={()=>setMainKey(item.key)} style={[local.mainButton,mainKey===item.key&&local.mainSelected]}><Text style={[s.muted,mainKey===item.key&&{color:'white'}]}>{mainKey===item.key?'Main photo':'Make main'}</Text></Pressable><View style={local.photoActions}><Pressable disabled={!index} onPress={()=>movePhoto(index,-1)}><MaterialCommunityIcons name="arrow-left" size={23} color={index?colors.primary:colors.border}/></Pressable><Pressable disabled={index===photos.length-1} onPress={()=>movePhoto(index,1)}><MaterialCommunityIcons name="arrow-right" size={23} color={index<photos.length-1?colors.primary:colors.border}/></Pressable><Pressable onPress={()=>removePhoto(item.key)}><MaterialCommunityIcons name="delete-outline" size={23} color={colors.error}/></Pressable></View></View>)}</View>
    {photos.length<3?<Button title={`Add photos (${photos.length}/3)`} kind="secondary" icon="camera" onPress={pick}/>:null}
    <Field label="Name" value={name} onChangeText={setName}/>
    <View style={{gap:8}}><Text style={s.label}>Animal type</Text><Pills options={TYPES} value={typeChoice} onChange={setTypeChoice}/></View>
    {typeChoice==='Other'?<Field label="Other animal type" value={otherType} onChangeText={setOtherType}/>:null}
    <Field label="Breed if known (optional)" value={breed} onChangeText={setBreed}/>
    <View style={{gap:8}}><Text style={s.label}>Colour (select all that apply)</Text><Pills options={COLOURS} value={colours} onChange={setColours} multiple/></View>
    <View style={{gap:8}}><Text style={s.label}>Sex</Text><Pills options={['Male','Female']} value={sex} onChange={setSex}/></View>
    <View style={{gap:8}}><Field label="Approximate age" value={age} onChangeText={setAge} keyboardType="decimal-pad" maxLength={5} placeholder="e.g. 8"/><Pills options={['Months','Years']} value={ageUnit} onChange={setAgeUnit}/></View>
    <Field label="Identifiable features" value={features} onChangeText={setFeatures} multiline placeholder="Collar, markings, scars or other useful details"/>
    <View style={s.row}><View style={{flex:1,gap:4}}><Text style={s.h2}>Home location</Text><Text style={s.muted}>Same as owner profile location</Text></View><Switch value={useOwnerLocation} onValueChange={setUseOwnerLocation} trackColor={{false:colors.border,true:colors.primary}} thumbColor="white"/></View>
    {useOwnerLocation?<Text style={s.body}>{formatGeneralLocation(ownerLocation)||'Complete your owner profile location first.'}</Text>:<LocationFields title="Animal home location" value={location} onChange={setLocation}/>}
    <Text style={s.h2}>Additional information</Text>
    <Pressable style={local.checkRow} onPress={()=>setChipped(value=>!value)}><MaterialCommunityIcons name={chipped?'checkbox-marked':'checkbox-blank-outline'} size={26} color={colors.primary}/><Text style={s.body}>Microchipped</Text></Pressable>
    <Pressable style={local.checkRow} onPress={()=>setHasMedical(value=>!value)}><MaterialCommunityIcons name={hasMedical?'checkbox-marked':'checkbox-blank-outline'} size={26} color={colors.primary}/><Text style={s.body}>Medical requirements</Text></Pressable>
    {hasMedical?<Field label="Medical requirements" value={medical} onChangeText={setMedical} multiline/>:null}
    <View style={{gap:8}}><Text style={s.label}>Approaching this animal</Text><Pills options={['Safe to approach','Use caution']} value={approach==='safe'?'Safe to approach':approach==='caution'?'Use caution':''} onChange={value=>setApproach(value==='Safe to approach'?'safe':'caution')}/></View>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Saving…':'Save animal'} disabled={busy} onPress={save}/>
    {old?<Button title="Remove animal" kind="danger" disabled={busy} onPress={confirmRemove}/>:null}
  </Screen>;
}

const local=StyleSheet.create({
  pills:{flexDirection:'row',flexWrap:'wrap',gap:8},pill:{paddingHorizontal:14,paddingVertical:9,borderRadius:radius.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},pillSelected:{borderColor:colors.primary,backgroundColor:colors.primaryLight},pillText:{fontSize:14},pillTextSelected:{color:colors.primary,fontFamily:'Nunito_700Bold'},
  photos:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},photoCard:{width:'31%',minWidth:96,gap:6},photo:{width:'100%',aspectRatio:1,borderRadius:radius.md,resizeMode:'cover',backgroundColor:colors.surfaceMuted},mainButton:{minHeight:34,alignItems:'center',justifyContent:'center',borderRadius:radius.sm,borderWidth:1,borderColor:colors.primary},mainSelected:{backgroundColor:colors.primary},photoActions:{flexDirection:'row',justifyContent:'space-around',alignItems:'center'},checkRow:{minHeight:44,flexDirection:'row',alignItems:'center',gap:10},
});
