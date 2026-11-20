import React from 'react';
import {Text} from 'react-native';
import {router} from 'expo-router';
import {Screen,AlertCard,Button,styles as s} from '../../ui';
import {useStore} from '../../store';

export default function Following(){
  const {alerts,following,toggleFollow}=useStore();
  const items=alerts.filter(alert=>following.includes(alert.id));
  return <Screen title="Following" lead="Missing and resolved alerts you want to keep close.">
    {items.length?items.map(alert=>{
      const displayAlert=alert.status==='reunited'?{...alert,status:'safe'}:alert;
      return <React.Fragment key={alert.id}>
        <AlertCard alert={displayAlert} onPress={()=>router.push(`/alert/${alert.id}`)}/>
        {alert.status==='reunited'?<Text style={s.body}>{alert.name} has been reunited and is now safe.</Text>:null}
        <Button title={`Unfollow ${alert.name}`} kind="secondary" onPress={()=>toggleFollow(alert.id)}/>
      </React.Fragment>;
    }):<Text style={s.body}>You are not following an alert yet.</Text>}
  </Screen>;
}
