// components/AnimatedTabBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 4;

const tabConfig = {
  AdmissionForm: { icon: 'assignment', label: 'Form' },
  Documents: { icon: 'cloud-upload', label: 'Documents' },
  Status: { icon: 'track-changes', label: 'Status' },
  Profile: { icon: 'person', label: 'Profile' },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedTabBar({ state, descriptors, navigation }) {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  React.useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 15,
      stiffness: 150,
    });
  }, [state.index]);

  return (
    <View style={[
      styles.tabBar,
      Platform.select({
        web: {
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        },
        default: {
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }
      })
    ]}>
      <Animated.View style={[styles.activeTabIndicator, animatedStyle]} />
      
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;
        const tabInfo = tabConfig[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconStyle = useAnimatedStyle(() => {
          const scale = isFocused ? withSpring(1.2) : withSpring(1);
          
          return {
            transform: [{ scale }],
          };
        });

        return (
          <AnimatedTouchable
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Animated.View style={[styles.iconContainer, iconStyle]}>
              <Icon 
                name={tabInfo.icon} 
                size={24} 
                color={isFocused ? '#3498db' : '#7f8c8d'} 
              />
            </Animated.View>
            <Text style={[styles.label, isFocused && styles.labelFocused]}>
              {tabInfo.label}
            </Text>
          </AnimatedTouchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  labelFocused: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    position: 'absolute',
    top: 0,
    width: TAB_WIDTH,
    height: 3,
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
});