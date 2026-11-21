import {Platform,Text,View} from 'react-native';
import DateTimePicker,{DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {Button,styles as s} from '../ui';

export function formatLastSeen(value){
  const date=value instanceof Date?value:new Date(value);
  const day=date.toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'});
  const time=date.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit',hour12:false});
  return `${day} at ${time}`;
}

export default function DateTimeFields({value,onChange,label='Last seen date and time'}){
  function open(mode){
    DateTimePickerAndroid.open({value,mode,is24Hour:true,maximumDate:new Date(),onValueChange:(_event,next)=>onChange(next),onDismiss:()=>{}});
  }
  if(Platform.OS==='android')return <View style={{gap:12}}>
    <Text style={s.label}>{label}</Text>
    <Button title={`Date: ${value.toLocaleDateString('en-ZA')}`} kind="secondary" icon="calendar" onPress={()=>open('date')}/>
    <Button title={`Time: ${value.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit',hour12:false})}`} kind="secondary" icon="clock-outline" onPress={()=>open('time')}/>
  </View>;
  return <View style={{gap:12}}>
    <Text style={s.label}>{label}</Text>
    <DateTimePicker value={value} mode="date" display="default" maximumDate={new Date()} onValueChange={(_event,next)=>onChange(next)}/>
    <DateTimePicker value={value} mode="time" display="default" is24Hour onValueChange={(_event,next)=>onChange(next)}/>
  </View>;
}
