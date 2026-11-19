import {Text} from 'react-native';
import {router} from 'expo-router';
import {AlertCard,Screen,styles as s} from '../ui';
import {useAuth} from '../auth';
import {useStore} from '../store';

export default function PastCases(){const {session}=useAuth(),{alerts}=useStore();const pastCases=alerts.filter(alert=>alert.ownerId===session?.user.id&&alert.status!=='missing');return <Screen title="Past cases" lead="Your closed and reunited alerts will appear here.">{pastCases.map(alert=><AlertCard key={alert.id} alert={alert} onPress={()=>router.push(`/manage/${alert.id}`)}/>)}{!pastCases.length?<Text style={s.body}>No past cases yet.</Text>:null}</Screen>}
