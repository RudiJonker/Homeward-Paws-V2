import {useState} from 'react';
import {Alert,Image,Modal,Pressable,StyleSheet,Text,View} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router} from 'expo-router';
import {Screen,Button,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import {supabase} from '../../supabase';
import {colors,radius,spacing} from '../../theme';

function MenuItem({icon,label,onPress,danger,disabled}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({pressed})=>[local.menuItem,pressed&&{opacity:.65},disabled&&{opacity:.45}]}><MaterialCommunityIcons name={icon} size={23} color={danger?colors.error:colors.primary}/><Text style={[s.body,{flex:1,color:danger?colors.error:colors.text}]}>{label}</Text><MaterialCommunityIcons name="chevron-right" size={23} color={colors.muted}/></Pressable>}

export default function Profile(){
  const {animals}=useStore();
  const {session,profile,signOut}=useAuth();
  const [menuOpen,setMenuOpen]=useState(false),[deleting,setDeleting]=useState(false);
  if(!session)return <Screen title="Profile" lead="Sign in to manage your private profile and animals."><Button title="Log in" onPress={()=>router.push('/login')}/><Button title="Create account" kind="secondary" onPress={()=>router.push('/signup')}/></Screen>;
  function go(path){setMenuOpen(false);router.push(path)}
  async function removeStorageFolder(bucket){
    const {data,error}=await supabase.storage.from(bucket).list(session.user.id,{limit:1000});if(error)throw error;
    const paths=(data||[]).filter(item=>item.name).map(item=>`${session.user.id}/${item.name}`);
    if(paths.length){const {error:removeError}=await supabase.storage.from(bucket).remove(paths);if(removeError)throw removeError}
  }
  async function deleteAccount(){
    setDeleting(true);
    try{
      await removeStorageFolder('animal-photos');await removeStorageFolder('avatars');
      const {error}=await supabase.rpc('delete_my_account');if(error)throw error;
      await supabase.auth.signOut({scope:'local'});router.replace('/');
    }catch(error){setDeleting(false);Alert.alert('Account could not be deleted',error.message)}
  }
  function confirmDelete(){
    setMenuOpen(false);
    Alert.alert('Delete your account?','This removes your profile, animals and stored photos. This action cannot be undone.',[
      {text:'Cancel',style:'cancel'},
      {text:'Continue',style:'destructive',onPress:()=>Alert.alert('Permanently delete account?','This is your final confirmation. Your Homeward Paws account will be permanently deleted.',[
        {text:'Keep account',style:'cancel'},
        {text:'Delete permanently',style:'destructive',onPress:deleteAccount},
      ],{cancelable:false})},
    ]);
  }
  return <>
    <Screen>
      <View style={local.header}><Text style={s.h1}>{profile?.display_name||session.user.email}</Text><Pressable accessibilityRole="button" accessibilityLabel="Open profile menu" onPress={()=>setMenuOpen(true)} style={local.menuButton}><MaterialCommunityIcons name="menu" size={30} color={colors.text}/></Pressable></View>
      <Text style={s.h2}>My Animals</Text>
      {animals.map(animal=><Pressable key={animal.id} style={[s.card,s.listCard]} onPress={()=>router.push(`/animal/${animal.id}`)}><Image source={animal.photo} style={s.thumbnail}/><View style={s.listBody}><Text style={s.h2}>{animal.name}</Text><Text style={s.body} numberOfLines={2}>{animal.type} · {animal.area}</Text></View><MaterialCommunityIcons name="chevron-right" size={28} color={colors.muted}/></Pressable>)}
      {!animals.length?<Text style={s.body}>No animals saved yet.</Text>:null}
    </Screen>
    <Modal visible={menuOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={()=>setMenuOpen(false)}>
      <Pressable style={local.backdrop} onPress={()=>setMenuOpen(false)}><Pressable style={local.menu} onPress={()=>{}}>
        <View style={local.menuHeader}><Text style={s.h2}>Profile menu</Text><Pressable accessibilityRole="button" accessibilityLabel="Close profile menu" onPress={()=>setMenuOpen(false)} hitSlop={8}><MaterialCommunityIcons name="close" size={27} color={colors.text}/></Pressable></View>
        <MenuItem icon="account-edit-outline" label="Edit my profile" onPress={()=>go('/complete-profile')}/>
        <MenuItem icon="paw" label="Add an animal" onPress={()=>go('/animal/new')}/>
        <MenuItem icon="history" label="Past cases" onPress={()=>go('/past-cases')}/>
        <View style={local.divider}/>
        <MenuItem icon="logout" label="Log out" onPress={async()=>{setMenuOpen(false);await signOut();router.replace('/')}}/>
        <MenuItem icon="delete-alert-outline" label={deleting?'Deleting account…':'Delete account'} danger disabled={deleting} onPress={confirmDelete}/>
      </Pressable></Pressable>
    </Modal>
  </>;
}

const local=StyleSheet.create({
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.md},menuButton:{width:48,height:48,borderRadius:radius.pill,alignItems:'center',justifyContent:'center',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border},
  backdrop:{flex:1,backgroundColor:'rgba(20,34,49,.42)',alignItems:'flex-end',paddingTop:64,paddingRight:16},menu:{width:'86%',maxWidth:380,backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.lg,gap:4,shadowColor:colors.text,shadowOpacity:.2,shadowRadius:18,shadowOffset:{width:0,height:8},elevation:8},
  menuHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:8,paddingBottom:8},menuItem:{minHeight:54,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:10,borderRadius:radius.sm},divider:{height:1,backgroundColor:colors.border,marginVertical:6},
});
