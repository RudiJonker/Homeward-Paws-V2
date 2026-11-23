import {useEffect,useMemo,useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router} from 'expo-router';
import {Screen,Field,AlertCard,Button,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import {splitGeneralLocation} from '../../location';
import {colors,radius,spacing} from '../../theme';

const PROVINCES=['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];
const TYPES=['All','Dog','Cat','Bird','Farm Animal','Horse','Other'];
const DATES=[['all','All'],['today','Today'],['7','7 days'],['30','30 days']];
const BROWSE_TABS=[['missing','Missing'],['found','Found'],['sighted','Sighted']];
const STANDARD_TYPES=TYPES.slice(1,-1);
const same=(a,b)=>(a||'').trim().toLowerCase()===(b||'').trim().toLowerCase();
const unique=values=>[...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b));

function Pill({label,selected,onPress}){return <Pressable onPress={onPress} style={[local.pill,selected&&local.pillSelected]}><Text style={[s.body,local.pillText,selected&&local.pillTextSelected]}>{label}</Text></Pressable>}
function BrowseTab({label,selected,onPress}){return <Pressable accessibilityRole="tab" accessibilityState={{selected}} onPress={onPress} style={[local.browseTab,selected&&local.browseTabSelected]}><Text style={[local.browseTabText,selected&&local.browseTabTextSelected]}>{label}</Text></Pressable>}
function SelectField({label,value,options,allLabel,onChange,disabled}){
  const [open,setOpen]=useState(false);
  return <>
    <View style={{gap:6}}><Text style={s.label}>{label}</Text><Pressable disabled={disabled} onPress={()=>setOpen(true)} style={[local.select,disabled&&{opacity:.45}]}><Text style={s.body}>{value||allLabel}</Text><MaterialCommunityIcons name="chevron-down" size={23} color={colors.muted}/></Pressable></View>
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={()=>setOpen(false)}><Pressable style={local.backdrop} onPress={()=>setOpen(false)}><View style={local.modal}><Text style={s.h2}>{label}</Text><ScrollView style={{maxHeight:420}}>{[{label:allLabel,value:''},...options.map(option=>({label:option,value:option}))].map(option=><Pressable key={option.label} onPress={()=>{onChange(option.value);setOpen(false)}} style={local.option}><Text style={[s.body,(value===option.value)&&{color:colors.primary,fontFamily:'Nunito_700Bold'}]}>{option.label}</Text>{value===option.value?<MaterialCommunityIcons name="check" size={22} color={colors.primary}/>:null}</Pressable>)}</ScrollView></View></Pressable></Modal>
  </>;
}

export default function Browse(){
  const {alerts,foundReports,sightedReports}=useStore(),{profile}=useAuth(),profileLocation=splitGeneralLocation(profile);
  const [view,setView]=useState('missing');
  const [q,setQ]=useState(''),[scope,setScope]=useState('all'),[searchOpen,setSearchOpen]=useState(true),[moreOpen,setMoreOpen]=useState(false);
  const [province,setProvince]=useState(''),[city,setCity]=useState(''),[suburb,setSuburb]=useState(''),[animalType,setAnimalType]=useState('All'),[dateRange,setDateRange]=useState('all');
  const [filterNow]=useState(()=>new Date());
  useEffect(()=>{
    if(profile?.id){setProvince(profileLocation.province);setCity(profileLocation.city);setSuburb(profileLocation.suburb);setScope('suburb')}
    else{setProvince('');setCity('');setSuburb('');setScope('all')}
    setAnimalType('All');setDateRange('all');setQ('');
  },[profile?.id,profileLocation.province,profileLocation.city,profileLocation.suburb]);
  const cities=useMemo(()=>unique(alerts.filter(alert=>!province||same(alert.province,province)).map(alert=>alert.city)),[alerts,province]);
  const suburbs=useMemo(()=>unique(alerts.filter(alert=>(!province||same(alert.province,province))&&(!city||same(alert.city,city))).map(alert=>alert.suburb)),[alerts,province,city]);
  function chooseScope(next){
    setScope(next);
    if(next==='suburb'||next==='city'||next==='province'){setProvince(profileLocation.province);setCity(profileLocation.city);setSuburb(profileLocation.suburb)}
    if(next==='all'){setProvince('');setCity('');setSuburb('')}
  }
  function reset(){
    if(profile?.id){setProvince(profileLocation.province);setCity(profileLocation.city);setSuburb(profileLocation.suburb);setScope('suburb')}
    else{setProvince('');setCity('');setSuburb('');setScope('all')}
    setAnimalType('All');setDateRange('all');setQ('');
  }
  function toggleSearch(){setSearchOpen(value=>{if(value)setMoreOpen(false);return !value})}
  const shown=alerts.filter(alert=>{
    if(alert.status!=='missing')return false;
    if(scope==='suburb'&&(!same(alert.province,profileLocation.province)||!same(alert.city,profileLocation.city)||!same(alert.suburb,profileLocation.suburb)))return false;
    if(scope==='city'&&(!same(alert.province,profileLocation.province)||!same(alert.city,profileLocation.city)))return false;
    if(scope==='province'&&!same(alert.province,profileLocation.province))return false;
    if(scope==='custom'&&((province&&!same(alert.province,province))||(city&&!same(alert.city,city))||(suburb&&!same(alert.suburb,suburb))))return false;
    if(animalType!=='All'&&(animalType==='Other'?STANDARD_TYPES.some(type=>same(alert.type,type)):!same(alert.type,animalType)))return false;
    if(dateRange!=='all'){
      const created=new Date(alert.createdAt).getTime();let threshold;
      if(dateRange==='today'){threshold=new Date(filterNow.getFullYear(),filterNow.getMonth(),filterNow.getDate()).getTime()}
      else threshold=filterNow.getTime()-Number(dateRange)*24*60*60*1000;
      if(!created||created<threshold)return false;
    }
    return `${alert.name} ${alert.area} ${alert.id}`.toLowerCase().includes(q.trim().toLowerCase());
  });
  const foundCutoff=filterNow.getTime()-30*24*60*60*1000;
  const visibleFoundReports=foundReports.filter(report=>report.status==='found'||(report.status==='reunited'&&new Date(report.reunitedAt).getTime()>=foundCutoff)).sort((a,b)=>{
    if(a.status==='found'&&b.status!=='found')return -1;if(a.status!=='found'&&b.status==='found')return 1;
    return new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime();
  });
  return <Screen title="Browse" lead="Browse animal reports in your community.">
    <View accessibilityRole="tablist" style={local.browseTabs}>{BROWSE_TABS.map(([value,label])=><BrowseTab key={value} label={label} selected={view===value} onPress={()=>setView(value)}/>)}</View>
    {view==='missing'?<>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:searchOpen}} onPress={toggleSearch} style={local.searchToggle}><Text style={[s.body,{color:colors.primary,fontFamily:'Nunito_700Bold'}]}>{searchOpen?'Hide search criteria':'Show search criteria'}</Text><MaterialCommunityIcons name={searchOpen?'chevron-up':'chevron-down'} size={25} color={colors.primary}/></Pressable>
    {searchOpen?<>
      <Field label="Search alerts" value={q} onChangeText={setQ} placeholder="Animal name, area or reference"/>
      {profile?.id?<View style={{gap:8}}><Text style={s.label}>Search area</Text><View style={local.pills}><Pill label="My suburb" selected={scope==='suburb'} onPress={()=>chooseScope('suburb')}/><Pill label="My city" selected={scope==='city'} onPress={()=>chooseScope('city')}/><Pill label={`All ${profileLocation.province}`} selected={scope==='province'} onPress={()=>chooseScope('province')}/></View></View>:<Text style={s.muted}>Showing missing animals across South Africa. Use More filters to choose an area.</Text>}
      <Button title={moreOpen?'Hide filters':'More filters'} kind="secondary" icon="filter-variant" onPress={()=>setMoreOpen(value=>!value)}/>
      {moreOpen?<View style={local.filters}>
        <Text style={s.h2}>Location</Text>
        <SelectField label="Province" value={province} options={PROVINCES} allLabel="All South Africa" onChange={value=>{setProvince(value);setCity('');setSuburb('');setScope('custom')}}/>
        <SelectField label="City or town" value={city} options={cities} allLabel="All cities" disabled={!province} onChange={value=>{setCity(value);setSuburb('');setScope('custom')}}/>
        <SelectField label="Suburb" value={suburb} options={suburbs} allLabel="All suburbs" disabled={!city} onChange={value=>{setSuburb(value);setScope('custom')}}/>
        <Text style={s.label}>Animal type</Text><View style={local.pills}>{TYPES.map(type=><Pill key={type} label={type} selected={animalType===type} onPress={()=>setAnimalType(type)}/>)}</View>
        <Text style={s.label}>Date reported</Text><View style={local.pills}>{DATES.map(([value,label])=><Pill key={value} label={label} selected={dateRange===value} onPress={()=>setDateRange(value)}/>)}</View>
        <Button title="Reset filters" kind="secondary" onPress={reset}/>
      </View>:null}
    </>:null}
    <Text style={s.muted}>{shown.length} missing {shown.length===1?'animal':'animals'} found</Text>
    {shown.map(alert=><AlertCard key={alert.id} alert={alert} onPress={()=>router.push(`/alert/${alert.id}`)}/>)}
    {!shown.length?<View style={local.empty}><MaterialCommunityIcons name="map-search-outline" size={38} color={colors.muted}/><Text style={s.h2}>No missing animals match these filters.</Text><Text style={s.muted}>Try a wider area, a longer date range or reset the filters.</Text></View>:null}
    </>:view==='found'?<>{visibleFoundReports.map(report=><AlertCard key={report.id} alert={report} onPress={()=>router.push(`/found/${report.id}`)}/>)}{!visibleFoundReports.length?<View style={local.empty}><MaterialCommunityIcons name="home-search-outline" size={38} color={colors.muted}/><Text style={s.h2}>No found animal reports yet.</Text><Text style={s.muted}>Found animals reported by the community will appear here.</Text></View>:null}</>:<>{sightedReports.filter(report=>report.status==='sighted').map(report=><AlertCard key={report.id} alert={report} onPress={()=>router.push(`/sighted/${report.id}`)}/>)}{!sightedReports.some(report=>report.status==='sighted')?<View style={local.empty}><MaterialCommunityIcons name="eye-outline" size={38} color={colors.muted}/><Text style={s.h2}>No sighted animal reports yet.</Text><Text style={s.muted}>Standalone animal sightings will appear here.</Text></View>:null}</>}
  </Screen>;
}

const local=StyleSheet.create({
  browseTabs:{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border},browseTab:{flex:1,minHeight:48,alignItems:'center',justifyContent:'center',borderBottomWidth:3,borderBottomColor:'transparent'},browseTabSelected:{borderBottomColor:colors.primary},browseTabText:{fontFamily:'Nunito_700Bold',fontSize:15,color:colors.muted},browseTabTextSelected:{color:colors.primary},
  searchToggle:{minHeight:44,paddingHorizontal:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderWidth:1,borderColor:colors.primary,borderRadius:radius.md,backgroundColor:colors.surface},
  pills:{flexDirection:'row',flexWrap:'wrap',gap:8},pill:{paddingHorizontal:13,paddingVertical:8,borderRadius:radius.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},pillSelected:{borderColor:colors.primary,backgroundColor:colors.primaryLight},pillText:{fontSize:13},pillTextSelected:{color:colors.primary,fontFamily:'Nunito_700Bold'},
  filters:{gap:spacing.md,padding:spacing.lg,borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,backgroundColor:colors.surface},select:{minHeight:52,paddingHorizontal:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderWidth:1,borderColor:colors.border,borderRadius:radius.sm,backgroundColor:colors.surface},
  backdrop:{flex:1,backgroundColor:'rgba(20,34,49,.42)',justifyContent:'center',padding:spacing.xl},modal:{backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.lg,gap:12},option:{minHeight:50,paddingHorizontal:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:colors.border},
  empty:{alignItems:'center',padding:spacing.xxl,gap:8,borderRadius:radius.lg,backgroundColor:colors.surfaceMuted},
});
