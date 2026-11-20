import {Text} from 'react-native';
import {router} from 'expo-router';
import {AlertCard,Screen,styles as s} from '../ui';
import {useAuth} from '../auth';
import {useStore} from '../store';

export default function MyReports(){
  const {session}=useAuth(),{alerts}=useStore();
  const reports=alerts.filter(alert=>alert.ownerId===session?.user.id);
  return <Screen title="My reports" lead="Open and manage alerts you have published.">
    {reports.map(alert=><AlertCard key={alert.id} alert={alert} onPress={()=>router.push(`/manage/${alert.id}`)}/>)}
    {!reports.length?<Text style={s.body}>You have not published a report yet.</Text>:null}
  </Screen>;
}
