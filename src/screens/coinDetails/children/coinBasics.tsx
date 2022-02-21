import React from 'react'
import { View, Text } from 'react-native'
import { DataPair } from '../../../redux/reducers/walletReducer'
import styles from './children.styles'


interface CoinBasicsProps {
    valuePairs:DataPair[];
    coinSymbol:string;
}

export const CoinBasics = ({valuePairs, coinSymbol}:CoinBasicsProps) => {

    const _renderCoinHeader = (
        <>
            <View style={styles.coinTitleContainer}>
             <Text style={styles.textCoinTitle}>{coinSymbol}</Text>
            </View>
         
            <Text style={styles.textHeaderChange}>Change <Text style={styles.textPositive}>+10.13%</Text></Text>
        </>
    )

    const _renderValuePair = (args:DataPair) => {
        return (
            <>
                <Text style={styles.textBasicValue}>{args.value}</Text>
                <Text style={styles.textBasicLabel}>{args.label}</Text>
            </>
        )

    }

    return (
        <View style={[styles.card, styles.basicsContainer]}>
            {_renderCoinHeader}
            {valuePairs.map((valPair)=>_renderValuePair(valPair))}
        </View>
    )
}
