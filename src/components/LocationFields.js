import {useState} from 'react';
import {Text,View} from 'react-native';
import {Button,Field,styles as s} from '../ui';
import {detectGeneralLocation} from '../location';
import {colors} from '../theme';

export default function LocationFields({value,onChange,title='Home location'}){
  const [detecting,setDetecting]=useState(false),[message,setMessage]=useState('');
  function update(field,next){onChange({...value,[field]:next})}
  async function detect(){
    setDetecting(true);setMessage('');
    try{
      const detected=await detectGeneralLocation();
      onChange(detected);
      setMessage(detected.suburb?'General location detected. Please check the fields.':'Province and city detected. Please add your suburb.');
    }catch(error){setMessage(error.message)}finally{setDetecting(false)}
  }
  return <View style={{gap:12}}>
    <Text style={s.h2}>{title}</Text>
    <Text style={s.muted}>Only your general location is saved. Exact coordinates and street details are not stored.</Text>
    <Button title={detecting?'Detecting location…':'Auto-detect location'} icon="crosshairs-gps" kind="secondary" disabled={detecting} onPress={detect}/>
    <Field label="Province" value={value.province} onChangeText={next=>update('province',next)} autoCapitalize="words"/>
    <Field label="City or town" value={value.city} onChangeText={next=>update('city',next)} autoCapitalize="words"/>
    <Field label="Suburb" value={value.suburb} onChangeText={next=>update('suburb',next)} autoCapitalize="words"/>
    {message?<Text style={[s.muted,{color:message.includes('detected')?colors.primary:colors.error}]}>{message}</Text>:null}
  </View>;
}
