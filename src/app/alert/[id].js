import {Image,Share,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Status,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';

export default function PublicAlert(){
  const {id}=useLocalSearchParams(),{alerts,following,toggleFollow}=useStore(),{session,setPendingAction}=useAuth();
  const alert=alerts.find(item=>item.id===id);
  if(!alert)return <Screen title="Alert unavailable"/>;
  const owns=alert.ownerId&&alert.ownerId===session?.user.id,isMissing=alert.status==='missing',isFollowing=following.includes(alert.id);
  const title=isMissing?`${alert.name} is missing`:alert.status==='reunited'?`${alert.name} is safe`:`${alert.name} alert closed`;
  async function share(){
    const summary=isMissing?`${alert.name} is missing near ${alert.area}.`:`${alert.name}'s alert has been resolved.`;
    await Share.share({message:`PREVIEW: ${summary} Reference ${alert.id}. Public web link not configured yet.`});
  }
  async function follow(){
    if(!session){await setPendingAction({route:`/alert/${alert.id}`,action:'follow'});router.push('/login');return}
    toggleFollow(alert.id);
  }
  return <Screen title={title} lead={`Public alert · ${alert.id}`}>
    <Image source={alert.photo} style={s.photo}/>
    <Status value={alert.status}/>
    <Card><Text style={s.h2}>Last seen</Text><Text style={s.body}>{alert.area}</Text><Text style={s.body}>{alert.lastSeen}</Text><Text style={s.body}>{alert.description}</Text>{alert.extra?<Text style={s.body}>{alert.extra}</Text>:null}</Card>
    <Button title="Share alert" icon="share-variant" onPress={share}/>
    {owns?<Button title="Manage alert" kind="secondary" onPress={()=>router.push(`/manage/${alert.id}`)}/>:isMissing?<>
      <Button title={isFollowing?'Unfollow alert':'Follow alert'} kind="secondary" onPress={follow}/>
      {session?<Button title="I saw this animal" icon="eye" onPress={()=>router.push(`/sighting/${alert.id}`)}/>:<Button title="Log in to send a sighting" icon="eye" onPress={async()=>{await setPendingAction({route:`/sighting/${alert.id}`});router.push('/login')}}/>}
    </>:isFollowing?<Button title="Unfollow alert" kind="secondary" onPress={follow}/>:null}
  </Screen>;
}
