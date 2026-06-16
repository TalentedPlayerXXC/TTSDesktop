import { Avatar } from 'antd';
import LogoCanvas from './LogoCanvas'
import LogoWhite from '../assets/fangxiu_Logo_white.png'
import './index.css'

function LoginComp(props: any) {
    const { theme, user = 'w' } = props;
    return (
        <div className='loginHead'>
            <div className='logo'>
                <LogoCanvas />
            </div>
            <div>
                {
                    user ?
                        <Avatar size={44} style={{ backgroundColor: '#131413ff', fontSize: '16px' }} src={LogoWhite} />
                        : "请登录"
                }
            </div>
        </div>
    );
}
export default LoginComp;
// })
