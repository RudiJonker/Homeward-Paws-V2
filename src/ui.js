import {Image,KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router,useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from './auth';
import {colors,radius,spacing} from './theme';

const navItems=[['home','home','Home'],['browse','magnify','Browse'],['report','paw','Report'],['following','heart-outline','Following'],['profile','account','Profile']];
function DetailTabs(){const insets=useSafeAreaInsets();return <View style={[s.detailTabs,{paddingBottom:Math.max(insets.bottom,8)}]}>{navItems.map(([route,icon,label])=><Pressable key={route} style={s.detailTab} onPress={()=>router.replace(`/${route}`)}><MaterialCommunityIcons name={icon} size={route==='report'?28:24} color={colors.muted}/><Text style={s.detailTabText}>{label}</Text></Pressable>)}</View>}
export function Screen({children,title,lead}){
  const segments=useSegments(),{session,profile}=useAuth(),inTabs=segments[0]==='(tabs)',isRequiredProfile=segments[0]==='complete-profile'&&!profile?.profile_completed,showTabs=!inTabs&&!!session&&!isRequiredProfile;
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS==='ios'?'padding':'height'} keyboardVerticalOffset={Platform.OS==='ios'?88:0}>
    <ScrollView style={s.screen} contentContainerStyle={[s.content,showTabs&&{paddingBottom:96}]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      {title&&<Text style={s.h1}>{title}</Text>}{lead&&<Text style={s.lead}>{lead}</Text>}{children}
    </ScrollView>
    {showTabs?<DetailTabs/>:null}
  </KeyboardAvoidingView>;
}
export function Card({children,style}){return <View style={[s.card,style]}>{children}</View>}
export function Button({title,onPress,kind='primary',icon,disabled}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,kind==='secondary'&&s.secondary,kind==='danger'&&s.danger,pressed&&s.pressed,disabled&&s.disabled]}>{icon&&<MaterialCommunityIcons name={icon} size={20} color={kind==='primary'?'white':kind==='danger'?colors.error:colors.primary}/>}<Text style={[s.buttonText,kind!=='primary'&&{color:kind==='danger'?colors.error:colors.primary}]}>{title}</Text></Pressable>}
export function Field({label,value,onChangeText,placeholder,multiline,...props}){return <View style={{gap:6}}><Text style={s.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} style={[s.input,multiline&&{height:92,textAlignVertical:'top'}]} {...props}/></View>}
export function Status({value='missing'}){const reunited=value==='reunited';return <View style={[s.chip,{backgroundColor:reunited?colors.reunitedTint:colors.missingTint}]}><MaterialCommunityIcons name={reunited?'home-heart':'alert-circle'} size={15} color={reunited?colors.reunited:colors.missing}/><Text style={[s.chipText,{color:reunited?colors.reunited:colors.missingText}]}>{value==='closed'?'CLOSED':value.toUpperCase()}</Text></View>}
export function AlertCard({alert,onPress}){return <Pressable onPress={onPress} style={[s.card,s.listCard]}><Image source={alert.photo} style={s.thumbnail}/><View style={s.listBody}><View style={s.row}><Status value={alert.status}/><Text style={s.ref}>{alert.id}</Text></View><Text style={s.h2}>{alert.name}</Text><Text style={s.body} numberOfLines={2}>{alert.type} · {alert.area}</Text></View><MaterialCommunityIcons name="chevron-right" size={28} color={colors.muted}/></Pressable>}

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},content:{padding:spacing.xl,paddingBottom:48,gap:spacing.lg},
  detailTabs:{minHeight:64,flexDirection:'row',paddingTop:7,backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.border},detailTab:{flex:1,alignItems:'center',justifyContent:'center',gap:2},detailTabText:{fontFamily:'Nunito_700Bold',fontSize:11,color:colors.muted},
  h1:{fontFamily:'Nunito_800ExtraBold',fontSize:28,lineHeight:34,color:colors.text},h2:{fontFamily:'Nunito_700Bold',fontSize:17,lineHeight:22,color:colors.text},lead:{fontFamily:'Nunito_400Regular',fontSize:15,lineHeight:22,color:colors.muted,marginTop:-8},body:{fontFamily:'Nunito_400Regular',fontSize:15,lineHeight:22,color:colors.text},muted:{fontFamily:'Nunito_600SemiBold',fontSize:13,lineHeight:18,color:colors.muted},
  card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.md,shadowColor:colors.text,shadowOpacity:.07,shadowRadius:10,shadowOffset:{width:0,height:3},elevation:2},listCard:{minHeight:132,flexDirection:'row',alignItems:'center',padding:12},listBody:{flex:1,gap:8},thumbnail:{width:104,height:104,borderRadius:radius.md,resizeMode:'contain',backgroundColor:colors.surfaceMuted},
  button:{minHeight:52,borderRadius:radius.md,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',paddingHorizontal:16,flexDirection:'row',gap:8},secondary:{backgroundColor:colors.surface,borderWidth:1.5,borderColor:colors.primary},danger:{backgroundColor:colors.surface,borderWidth:1.5,borderColor:colors.error},pressed:{opacity:.82},disabled:{opacity:.45},buttonText:{fontFamily:'Nunito_700Bold',fontSize:16,color:'white'},
  label:{fontFamily:'Nunito_700Bold',fontSize:13,color:colors.text},input:{minHeight:52,borderRadius:radius.sm,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,padding:14,fontFamily:'Nunito_400Regular',fontSize:15,color:colors.text},photo:{width:'100%',height:220,borderRadius:radius.lg,resizeMode:'contain',backgroundColor:colors.surfaceMuted},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},chip:{alignSelf:'flex-start',borderRadius:radius.pill,paddingHorizontal:10,paddingVertical:6,flexDirection:'row',alignItems:'center',gap:5},chipText:{fontFamily:'Nunito_800ExtraBold',fontSize:11,letterSpacing:.5},ref:{fontFamily:'Nunito_700Bold',fontSize:12,color:colors.muted},
});
export {s as styles};
