import {Image,Text} from 'react-native';
import {router} from 'expo-router';
import {Screen,Card,Button,AlertCard,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';

export default function Home(){
  const {alerts}=useStore();
  const {session}=useAuth();
  const active=alerts.find(alert=>alert.ownerId===session?.user.id&&alert.status==='missing');
  return <Screen title="Bring them home" lead="Quick help when an animal goes missing.">
    <Image source={require('../../../assets/logo-horizontal.png')} style={{width:220,height:82,resizeMode:'contain',alignSelf:'center'}}/>
    <Card>
      <Button title="Report my animal missing" icon="alert-circle" onPress={()=>router.push('/report-missing')}/>
      <Button title="Browse missing animals" icon="magnify" kind="secondary" onPress={()=>router.push('/browse')}/>
    </Card>
    {active&&<><Text style={s.h2}>My active alert</Text><AlertCard alert={active} onPress={()=>router.push(`/manage/${active.id}`)}/><Button title="View sightings" onPress={()=>router.push(`/manage/${active.id}`)}/><Button title="Share again (preview)" kind="secondary" icon="share-variant" onPress={()=>router.push(`/alert/${active.id}`)}/></>}
  </Screen>;
}
