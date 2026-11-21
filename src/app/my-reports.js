import {useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {AlertCard,Screen,styles as s} from '../ui';
import {useAuth} from '../auth';
import {useStore} from '../store';
import {colors} from '../theme';

function ReportTab({label,selected,onPress,badge=0}){return <Pressable accessibilityRole="tab" accessibilityState={{selected}} onPress={onPress} style={[local.tab,selected&&local.selected]}><Text style={[local.label,selected&&local.selectedLabel]}>{label}</Text>{badge?<View style={local.badge}><Text style={local.badgeText}>{badge>99?'99+':badge}</Text></View>:null}</Pressable>}

export default function MyReports(){
  const {session}=useAuth(),{alerts,foundReports,sightedReports}=useStore();
  const [view,setView]=useState('own');
  const reports=alerts.filter(alert=>alert.ownerId===session?.user.id);
  const found=foundReports.filter(report=>report.ownerId===session?.user.id);
  const sighted=sightedReports.filter(report=>report.ownerId===session?.user.id);
  const missingPending=reports.reduce((total,report)=>total+report.sightings.filter(item=>item.contactStatus==='pending').length,0);
  const otherPending=[...found,...sighted].reduce((total,report)=>total+report.contacts.filter(item=>item.contact_status==='pending').length,0);
  return <Screen title="My reports" lead="Open and manage alerts you have published.">
    <View accessibilityRole="tablist" style={local.tabs}><ReportTab label="My own animals" badge={missingPending} selected={view==='own'} onPress={()=>setView('own')}/><ReportTab label="Other animal reports" badge={otherPending} selected={view==='other'} onPress={()=>setView('other')}/></View>
    {view==='own'?<>{reports.map(alert=>{const count=alert.sightings.filter(item=>item.contactStatus==='pending').length;return <AlertCard key={alert.id} alert={alert} noticeCount={count} onPress={()=>router.push(`/manage/${alert.id}`)}/>})}{!reports.length?<Text style={s.body}>You have not published a Missing report for one of your animals.</Text>:null}</>:<>{found.map(report=>{const count=report.contacts.filter(item=>item.contact_status==='pending').length;return <AlertCard key={`found-${report.id}`} alert={report} noticeCount={count} onPress={()=>router.push(`/manage-found/${report.id}`)}/>})}{sighted.map(report=>{const count=report.contacts.filter(item=>item.contact_status==='pending').length;return <AlertCard key={`sighted-${report.id}`} alert={report} noticeCount={count} onPress={()=>router.push(`/manage-sighted/${report.id}`)}/>})}{!found.length&&!sighted.length?<Text style={s.body}>You have not published a standalone Found or Sighted report.</Text>:null}</>}
  </Screen>;
}

const local=StyleSheet.create({
  tabs:{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border},
  tab:{flex:1,minHeight:54,flexDirection:'row',gap:6,alignItems:'center',justifyContent:'center',paddingHorizontal:8,borderBottomWidth:3,borderBottomColor:'transparent'},
  selected:{borderBottomColor:colors.primary},
  label:{fontFamily:'Nunito_700Bold',fontSize:14,textAlign:'center',color:colors.muted},
  selectedLabel:{color:colors.primary},
  badge:{minWidth:21,height:21,paddingHorizontal:5,borderRadius:11,alignItems:'center',justifyContent:'center',backgroundColor:colors.error},
  badgeText:{fontFamily:'Nunito_800ExtraBold',fontSize:10,color:'white'},
});
