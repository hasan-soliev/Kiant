import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Models from '../screens/models.component';
import Links from '../screens/links.component';
import MoreModels from '../screens/more-models.component';

const RootNavigation = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Models"
        component={Models}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Links"
        component={Links}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MoreModels"
        component={MoreModels}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default RootNavigation;
