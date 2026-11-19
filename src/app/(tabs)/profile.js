import {Image,Pressable,Text,View} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router} from 'expo-router';
import {Screen,Card,Button,AlertCard,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import {colors} from '../../theme';

export default function Profile(){
  const {animals,alerts}=useStore();
  const {session,profile,signOut}=useAuth();
  if(!session)return <Screen title="Profile" lead="Sign in to manage your private profile and animals."><Button title="Log in" onPress={()=>router.push('/login')}/><Button title="Create account" kind="secondary" onPress={()=>router.push('/signup')}/></Screen>;
  const pastCases=alerts.filter(a=>a.ownerId===session.user.id&&a.status!=='missing');
  return <Screen title="Profile" lead={profile?.display_name||session.user.email}>
    <Card><Text style={s.h2}>{profile?.display_name}</Text>{profile?.home_area?<Text style={s.body}>{profile.home_area}</Text>:null}<Button title="Edit profile" kind="secondary" onPress={()=>router.push('/complete-profile')}/><Button title="Log out" kind="danger" onPress={async()=>{await signOut();router.replace('/')}}/></Card>
    <Text style={s.h2}>My Animals</Text>
    {animals.map(a=><Pressable key={a.id} style={[s.card,s.listCard]} onPress={()=>router.push(`/animal/${a.id}`)}><Image source={a.photo} style={s.thumbnail}/><View style={s.listBody}><Text style={s.h2}>{a.name}</Text><Text style={s.body} numberOfLines={2}>{a.type} · {a.area}</Text></View><MaterialCommunityIcons name="chevron-right" size={28} color={colors.muted}/></Pressable>)}
    {!animals.length?<Text style={s.body}>No animals saved yet.</Text>:null}
    <Button title="Add an animal" kind="secondary" onPress={()=>router.push('/animal/new')}/>
    <Text style={s.h2}>Past cases</Text>
    {pastCases.map(a=><AlertCard key={a.id} alert={a} onPress={()=>router.push(`/manage/${a.id}`)}/>)}
    {!pastCases.length&&<Text style={s.body}>No past cases yet.</Text>}
  </Screen>;
}
