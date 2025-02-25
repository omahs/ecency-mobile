import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ImageStyle } from 'react-native-fast-image';
import { isRTL } from '../../../utils/I18nUtils';

export default EStyleSheet.create({
  cardContainer: {
    backgroundColor: '$primaryLightBackground',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '$primaryLightBackground',
  } as ViewStyle,

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  } as ViewStyle,

  cardTitleContainer: {
    marginHorizontal: 8,
    flex: 1,
  } as ViewStyle,

  cardValuesContainer: {
    marginHorizontal: 8,

    justifyContent: 'flex-end',
  } as ViewStyle,


  logoContainer: {
    paddingRight: 8
  } as ImageStyle,

  menuIcon: {
    color: '$primaryBlue',
    paddingLeft: 12,
  } as ViewStyle,

  header: {
    backgroundColor: '$primaryBackgroundColor',
  },
  dotStyle: {
    backgroundColor: '$darkGrayBackground',
  },

  claimContainer:{
    marginBottom:16,
  },

  chartContainer: {
    height:80,
    marginTop:-16,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 4,
    left: isRTL() ? 16 : 76,
    right: isRTL() ? 76 : 16,
    paddingTop: 4,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    borderColor: '$chartText',
    borderTopWidth: EStyleSheet.hairlineWidth,
  } as ViewStyle,
  textDiffPositive: {
    fontSize: 14,
    color: '$primaryGreen',
    textAlign: 'left',
  } as TextStyle,
  textDiffNegative: {
    fontSize: 14,
    color: '$primaryRed',
    textAlign: 'left',
  } as TextStyle,
  textCurValue: {
    fontSize: 14,
    color: '$primaryBlack',
    fontWeight: '300',
    textAlign: 'left',
  } as TextStyle,
  textTitle: {
    fontSize: 16,
    color: '$primaryBlack',
    fontWeight: '500',
    textAlign: 'left',
  },
  textSubtitle: {
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: '300',
    textAlign: 'left',
  } as TextStyle,
  textSubtitleRight: {
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: '300',
    textAlign: 'right',
  } as TextStyle,
});
