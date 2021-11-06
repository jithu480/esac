/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
//mac EC:8D:3A:EE:AF:AF:9E
import React, {
  useState,
  useEffect,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { stringToBytes,bytesToString } from "convert-string";
import BleManager, { connect } from 'react-native-ble-manager';
import crc32 from 'crc/crc32';
import { crc16, crc16ccitt, crc16kermit, crc16modbus, crc16xmodem } from 'crc';



const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);

  var periph = [];

  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        setIsScanning(true);
      }).catch(err => {
        console.error(err);
      });
    }
  }

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }

  const handleDisconnectedPeripheral = (data) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  // const handleUpdateValueForstate = (data) => {
  //   console.log('the first declared state fired');
  //   console.log('Received data from ' + data + ' characteristic ' + data.characteristic, data.value);
  // }
  
  const handleUpdateValueForCharacteristic = (data) => {
    console.log('the first declared event fired');
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

   var CRCHi = [
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40,
    0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40,
    0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40,
    0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40
  ];
    var CRCLo = [
    0x00, 0xC0, 0xC1, 0x01, 0xC3, 0x03, 0x02, 0xC2, 0xC6, 0x06,
    0x07, 0xC7, 0x05, 0xC5, 0xC4, 0x04, 0xCC, 0x0C, 0x0D, 0xCD,
    0x0F, 0xCF, 0xCE, 0x0E, 0x0A, 0xCA, 0xCB, 0x0B, 0xC9, 0x09,
    0x08, 0xC8, 0xD8, 0x18, 0x19, 0xD9, 0x1B, 0xDB, 0xDA, 0x1A,
    0x1E, 0xDE, 0xDF, 0x1F, 0xDD, 0x1D, 0x1C, 0xDC, 0x14, 0xD4,
    0xD5, 0x15, 0xD7, 0x17, 0x16, 0xD6, 0xD2, 0x12, 0x13, 0xD3,
    0x11, 0xD1, 0xD0, 0x10, 0xF0, 0x30, 0x31, 0xF1, 0x33, 0xF3,
    0xF2, 0x32, 0x36, 0xF6, 0xF7, 0x37, 0xF5, 0x35, 0x34, 0xF4,
    0x3C, 0xFC, 0xFD, 0x3D, 0xFF, 0x3F, 0x3E, 0xFE, 0xFA, 0x3A,
    0x3B, 0xFB, 0x39, 0xF9, 0xF8, 0x38, 0x28, 0xE8, 0xE9, 0x29,
    0xEB, 0x2B, 0x2A, 0xEA, 0xEE, 0x2E, 0x2F, 0xEF, 0x2D, 0xED,
    0xEC, 0x2C, 0xE4, 0x24, 0x25, 0xE5, 0x27, 0xE7, 0xE6, 0x26,
    0x22, 0xE2, 0xE3, 0x23, 0xE1, 0x21, 0x20, 0xE0, 0xA0, 0x60,
    0x61, 0xA1, 0x63, 0xA3, 0xA2, 0x62, 0x66, 0xA6, 0xA7, 0x67,
    0xA5, 0x65, 0x64, 0xA4, 0x6C, 0xAC, 0xAD, 0x6D, 0xAF, 0x6F,
    0x6E, 0xAE, 0xAA, 0x6A, 0x6B, 0xAB, 0x69, 0xA9, 0xA8, 0x68,
    0x78, 0xB8, 0xB9, 0x79, 0xBB, 0x7B, 0x7A, 0xBA, 0xBE, 0x7E,
    0x7F, 0xBF, 0x7D, 0xBD, 0xBC, 0x7C, 0xB4, 0x74, 0x75, 0xB5,
    0x77, 0xB7, 0xB6, 0x76, 0x72, 0xB2, 0xB3, 0x73, 0xB1, 0x71,
    0x70, 0xB0, 0x50, 0x90, 0x91, 0x51, 0x93, 0x53, 0x52, 0x92,
    0x96, 0x56, 0x57, 0x97, 0x55, 0x95, 0x94, 0x54, 0x9C, 0x5C,
    0x5D, 0x9D, 0x5F, 0x9F, 0x9E, 0x5E, 0x5A, 0x9A, 0x9B, 0x5B,
    0x99, 0x59, 0x58, 0x98, 0x88, 0x48, 0x49, 0x89, 0x4B, 0x8B,
    0x8A, 0x4A, 0x4E, 0x8E, 0x8F, 0x4F, 0x8D, 0x4D, 0x4C, 0x8C,
    0x44, 0x84, 0x85, 0x45, 0x87, 0x47, 0x46, 0x86, 0x82, 0x42,
    0x43, 0x83, 0x41, 0x81, 0x80, 0x40
    ];

      function CRC16A(pucFrame, usLen)
      {
     var ucCRCHi = 0xFF;
     var ucCRCLo = 0xFF;
      var iIndex= 0x0000;

    while(usLen--)
    {
    iIndex = ucCRCLo ^ (pucFrame++);
    ucCRCLo = ucCRCHi ^ CRCHi[iIndex];
    ucCRCHi = CRCLo[iIndex];
    };
    console.log('Hi value is ' + ucCRCHi + ' Low value is ' +ucCRCLo);
    return (ucCRCHi << 8 | ucCRCLo);
    
    };
    

   async function retrieveConnected () {
    BleManager.getConnectedPeripherals([]).then((results) => {

      var service = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
      var writeCharacteristic = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
      var readCharacteristic = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
      var read2 ='2a04'
      var service2 = '1800';
      var service3 = '1801';
      var writeCharacteristic2 = '2a00';
      var writeCharacteristic3 = '2a01';
      var writeCharacteristic4 = '2a04';
      //var crustCharacteristic = '13333333-3333-3333-3333-333333330001';

      if (results.length == 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      console.log('executed retrieveconnected')
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        periph = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
      console.log(peripherals);
      console.log(periph);

     //SAAbhijith
     //const secret = "FEBAEEA98C88888889";
     //const secret = "6634253C4D7B60597F144E";
     const secret = "FE340118794F546D4B35307A";
     console.log(secret);
     const crcvalue = crc16(secret).toString(16);
     console.log(secret);
     console.log('crc16 converted value is ' + crcvalue);
     console.log('executed writetoble')


     //writedata ='AgEGDf///+yNOu6vns0AJQAFCUxPQ0sRB57K3CQO5angk/OjtQEAQG4AAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
       BleManager.retrieveServices(periph.id).then((peripheralInfo) => {
        console.log('entered retrieveservices')
        console.log('peripheral id is : ' + periph.id);
        //console.log(peripheralInfo);

        setTimeout(() => {
           BleManager.startNotificationUseBuffer(periph.id, service, readCharacteristic,1234).then(() => {
            console.log('Started notification on ' + readCharacteristic);
                setTimeout(() => { //yOTmK50z   0xFE0x320x000x110x08yOTmK50z
               // var writedata = "FE6634253C4D7B60597F144EB4F6";
               //var writedata = "FE3401181217984109755348122";
               var writedata = "0xFE0x340x0118yOTmK50z";
               var defaultdata = "yOTmK50z";
             
               //var crcvalue = crc16modbus(writedata).toString(16);
               var cyclered = CRC16A(writedata,16);
               console.log(cyclered)
               console.log('crc value of data is '+ cyclered);
               var writedataa = writedata + cyclered;
               //var writedataa = writedata + crcvalue;
                writedata = stringToBytes(writedataa);

                
                console.log('data with crc is '+ writedataa);
               //const writedata = '0x11';
                //var writedata = '0xFE0x320x000x110x08yOTmK50z';  0xFE,0xBA,0xEE,0xA9,0x8C,0x88,0x88,0x88,0x89,0x5B,0xC2
                console.log(writedata);

                //console.log('service is ' + service);
               const peripherlid = periph.id
                //console.log('..........' +peripherlid);
                
                // bleManagerEmitter.addListener('BleManagerDidUpdateState',(args) => {
                //    //({ peripherlid, writeCharacteristic, service }) => {
                //   //const data = bytesToString(readCharacteristic);
                //   console.log('************the event is fired.********');
                //   console.log(`Recieved ${args.state} for characteristic ${writeCharacteristic}`);
                //  });
              //  bleManagerEmitter.addListener(
              //    'BleManagerDidUpdateValueForCharacteristic',
              //    ({ writeCharacteristic,peripherlid, readCharacteristic, service }) => {
              //     //({ peripherlid, writeCharacteristic, service }) => {
              //    const data = bytesToString(readCharacteristic);
              //    console.log('************the event is fired.********');
              //    console.log(`Recieved ${data} for characteristic ${writeCharacteristic}`);
              //   });
             //BleManager.checkState();
              BleManager.write(periph.id, service, writeCharacteristic, writedata).then(() => {

                console.log(' Writed characteristic ' + bytesToString(writedata));
                console.log('Writed characteristic get key,the key is :' + writedata);
              });
  });

  

}).catch((error) => { console.log(error);}); //start notification
        });
      });
   });
  }
     //EAAbhijith
    //});
  //}

  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
  }

  //SAAbhijith
  const writetoble = (periph) => {
    const secret = [];
    var service = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
      var writeCharacteristic = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
      var readCharacteristic = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
      var read2 ='2a04'
      var service2 = '1800';
      var service3 = '1801';
      var writeCharacteristic2 = '2a00';
      var writeCharacteristic3 = '2a01';
      var writeCharacteristic4 = '2a04';
    
    console.log('executed writetoble');

    BleManager.getConnectedPeripherals([]).then((results) => {

      if (results.length == 0) {
        console.log('No connected peripherals')
      }      
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        periph = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });

    setTimeout(() => {
      BleManager.retrieveServices(periph.id).then((peripheralInfo) => {
        
        console.log('entered retrieve services for read')
       // console.log('peripheral id is : ' + periph.id);
  
    BleManager.read(periph.id, service,readCharacteristic)
     .then((readdata) => {
     console.log('read characteristic, the key is :' + readdata );
     console.log('read characteristic ' + bytesToString(readdata));
    // const buffer = Buffer.Buffer.from(readData); //https://github.com/feross/buffer#convert-arraybuffer-to-buffer
     //const sensorData = buffer.readUInt8(1, true);
     //console.log(buffer);
     //console.log(sensorData);
    })
     .catch((error) => { console.log(error);}); //read
  });
  }); //timeout of retrieve and read
 
  };
  //EAAbhijith

  //const diconnectperipheral = (peripheral) => {
    // async function connectAndPrepare(peripheral, service, characteristic) {
    //   var service = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    // var writeCharacteristic = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    // var crustCharacteristic = '13333333-3333-3333-3333-333333330001';

    // const handleUpdateValueForCharacteristic = (data) => {
    //   console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    // }

      // Connect to device
     // await BleManager.connect(peripheral);
      // Before startNotification you need to call retrieveServices
      //await BleManager.retrieveServices(peripheral);
      // To enable BleManagerDidUpdateValueForCharacteristic listener
      //await BleManager.startNotification(peripheral, service, characteristic);
      // Add event listener
     // BleManager.BleManagerDidUpdateValueForCharacteristic(value, peripheral, characteristic, service).then(() => {
          // Convert bytes array to string
          //const data = bytesToString(value);
          //console.log(`Recieved ${data} for characteristic ${characteristic}`);
       // });
      // Actions triggereng BleManagerDidUpdateValueForCharacteristic event
    //}
  //};

  const unlock = (periph) => {
    var service = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
      var writeCharacteristic = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
      var readCharacteristic = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
      var read2 ='2a04'
      var service2 = '1800';
      var service3 = '1801';
      var writeCharacteristic2 = '2a00';
      var writeCharacteristic3 = '2a01';
      var writeCharacteristic4 = '2a04';
       writedata =  'FE340118yOTmK50z'; 
    setTimeout(() => {
      BleManager.retrieveServices(periph.id).then((peripheralInfo) => {
        console.log(' retrieve services for unlock')
        BleManager.write(periph.id, service, writeCharacteristic, writedata).then(() => {

          console.log(' Writed characteristic ' + bytesToString(writedata));
          console.log('Writed characteristic get key,the key is :' + writedata);
        });
  });
  }); //timeout of retrieve and read
  }

  const testPeripheral = (peripheral) => {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id).then(() => {
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            setList(Array.from(peripherals.values()));
          }
          console.log('Connected to ' + peripheral.id);
          console.log('eda ithu connect ayi :' + peripheral.id);

          setTimeout(() => {

            /* Test read current RSSI value */
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);

              // SAABhijith 6e400001-b5a3-f393-e0a9-e50e24dcca9e
              //BleManager.connect("EC:8D:3A:EE:AF:AF:9E").then((results) => {
              //   BleManager.connect("1800").then((results) => {
              // if (results.length == 0) {
              //     console.log('connected lock')
              //   }
              // });
              //EAAbhijith

              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.log('Retrieved actual RSSI value', rssi);

                let p = peripherals.get(peripheral);
                console.log('pheripheral -- ', peripheral);
                if (p) {
                  p.rssi = rssi;
                  peripherals.set(peripheral.id, p);
                  setList(Array.from(peripherals.values()));
                  console.log('every peripheral', p);
                }
                console.log('after rssi value', rssi);
              });


            });

            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
            /*
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';
              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log('Started notification on ' + peripheral.id);
                  setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log('Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                        console.log('Writed 351 temperature, the pizza should be BAKED');

                        //var PizzaBakeResult = {
                        //  HALF_BAKED: 0,
                        //  BAKED:      1,
                        //  CRISPY:     2,
                        //  BURNT:      3,
                        //  ON_FIRE:    4
                        //};
                      });
                    });
                  }, 500);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });*/



          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }

  }

  useEffect(() => {
    BleManager.start({ showAlert: false });
    const data = stringToBytes("EC:8D:3A:EE:AF:AF:9E");
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
    //bleManagerEmitter.addListener('BleManagerDidUpdateState', handleUpdateValueForstate);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

    return (() => {
      console.log('unmount');
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
      bleManagerEmitter.removeAllListeners('BleManagerStopScan', handleStopScan);
      bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
      bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
    })
  }, []);

  const renderItem = (item) => {
    const color = item.connected ? 'green' : 'red';
    return (
      <TouchableHighlight onPress={() => testPeripheral(item)}>
        <View style={[styles.row, { backgroundColor: color }]}>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{item.name}</Text>
          <Text style={{ fontSize: 10, textAlign: 'center', color: '#333333', padding: 2 }}>RSSI: {item.rssi}</Text>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20 }}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>

            <View style={{ margin: 10 }}>
              <Button
                title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}
                onPress={() => startScan()}
              />
            </View>

            <View style={{ margin: 10 }}>
              <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()} />
            </View>

            {/* SAAbhijith */}

            <View style={{ margin: 30 }}>
              <Button title="unlock" onPress={() => unlock()} />
            </View>

            <View style={{ margin: 30 }}>
              <Button title="read on connected" onPress={() => writetoble(periph)} />
            </View>

            <View style={{ margin: 30 }}>
              <Button title="Disconnect" onPress={() => connectAndPrepare(periph)} />
            </View>
            {/* EAAbhijith */}


            {(list.length == 0) &&
              <View style={{ flex: 1, margin: 20 }}>
                <Text style={{ textAlign: 'center' }}>No peripherals</Text>
              </View>
            }


          </View>
        </ScrollView>
        <FlatList
          data={list}
          renderItem={({ item }) => renderItem(item)}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
