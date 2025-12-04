import React, {useState, useEffect} from 'react';
import { View, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen(){
  const [image, setImage] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const {status} = await ImagePicker.requestCameraPermissionsAsync();
      if(status !== 'granted'){
        alert('Camera permission denied');
      }
    })();
  },[]);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({quality:0.6});
    if(!result.cancelled){
      setImage(result.assets?.[0]?.uri || result.uri);
    }
  };

  return (
    <View style={{padding:16}}>
      <Text variant="titleLarge">Camera</Text>
      <Button onPress={takePhoto} style={{marginTop:8}}>Take Photo</Button>
      {image && <Image source={{uri:image}} style={{width:300,height:200,marginTop:12}} />}
    </View>
  );
}
