import {Alert,Share,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Status,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';

export default function Manage(){
  const {id}=useLocalSearchParams(),{alerts,endAlert}=useStore(),{session}=useAuth();
  const alert=alerts.find(item=>item.id===id);
  if(!alert)return <Screen title="Alert unavailable"/>;
  if(alert.ownerId!==session?.user.id)return <Screen title="Private owner view" lead="Only the member who posted this alert can manage it."><Button title="View public alert" onPress={()=>router.replace(`/alert/${alert.id}`)}/></Screen>;
  function finish(status){
    Alert.alert(status==='reunited'?'Mark reunited?':'Close without reunion?',status==='reunited'?'This removes the alert from Browse and moves it to past cases.':'This closes the alert without saying the animal was reunited.',[
      {text:'Cancel',style:'cancel'},
      {text:'Confirm',onPress:async()=>{try{await endAlert(alert.id,status);router.replace('/profile')}catch(error){Alert.alert('Alert could not be updated',error.message)}}},
    ]);
  }
  return <Screen title={`Manage ${alert.name}`} lead={alert.id}>
    <Status value={alert.status}/>
    <Button title="View public alert" kind="secondary" onPress={()=>router.push(`/alert/${alert.id}`)}/>
    <Button title="Share again (preview)" kind="secondary" icon="share-variant" onPress={()=>Share.share({message:`PREVIEW: ${alert.name} is missing. Reference ${alert.id}.`})}/>
    <Text style={s.h2}>Private sightings</Text>
    {alert.sightings.map(sighting=><Card key={sighting.id}><Text style={s.h2}>{sighting.area}</Text><Text style={s.body}>{sighting.when}</Text>{sighting.note?<Text style={s.body}>{sighting.note}</Text>:null}</Card>)}
    {!alert.sightings.length?<Card><Text style={s.body}>No sightings yet.</Text></Card>:null}
    {alert.status==='missing'?<Card><Text style={s.h2}>End this alert</Text><Button title="Mark reunited" icon="home-heart" onPress={()=>finish('reunited')}/><Button title="Close without reunion" kind="danger" onPress={()=>finish('closed')}/></Card>:null}
  </Screen>;
}
