import { memo, useCallback, useLayoutEffect } from "react"; 
import Input from '@/components/input'
import Button from '@/components/button'
import { Search } from '@/components/icons'  

import TinyPlayer from '@/assets/TinyPlayer'
import Markdown from '@/assets/Markdown'
import { useMemoizedFn, useFullScreen, useCreation, usePagination, useUpdate } from '@/common/hooks' 
import { useFetch, apis } from '@/request/index'
import Group from "@/components/group";
import Tooltip from '@/components/tooltip'
import Card from "@/components/card";
import './index.css'

 

export default memo((_props)=>{ 
    // console.log({ a: 'HOME', props, player });
    console.log({ Markdown, TinyPlayer })
 
    const [https] = useFetch()
    const [state, setState, { navigate }] = useUpdate({ loading: true })

  
    useLayoutEffect(()=>{
        // state.tp = new TinyPlayer({
        //     // container: document.querySelector('#tiny-player'), // 挂载节点
        //     poster: 'https://tiny-player.vercel.app/movie.png', // 封面地址 
        //     preload: 'metadata', // 预加载 
        //     type: 'auto', // 视频类型
        //     waterMarkShow: true, // 是否显示水印 
        //     width: '80%', // 自定义宽度 
        // });

        const holiday = String(apis.holiday).replace('$var', '2023');

        https?.get(holiday).then((res: any)=>{
            const days = res?.days?.reduce((summ:any, item:any)=>{ 
                summ[item.name] = summ[item.name] || [];
                
                if(item.isOffDay){
                    summ[item.name].push(item.date)
                }
                return summ 
            },{});

            setState({ days, holiday: Object.keys(days) }) 
        });


    },[])


    const onGetAnalysis = useCallback(async (url:string):Promise<any>=>{
        const data = await https.get(apis.analysis, { data: { url: url }})
   
        if(state.tp && data.data){
            state.tp.options.poster = data.data.cover
            state.tp.options.src = data.data.url 
            state.tp.setup() 
        } 
        setState({ analysis: data.data ? data.data : {} })
    },[])

    const onChange = useMemoizedFn(():any=>{
        const value = state.input || ''
        const regex = /http[s]?:\/\/[\w.]+[\w\/]*[\w.]*\??[\w=&:\-\+\%]*[/]*/
        const [url] = value?.match(regex) || [];
        url && onGetAnalysis(url);
    });

    const onInput = useMemoizedFn((event: React.ChangeEvent<HTMLInputElement>):any=>{
        const value = event?.target?.value
        state.input = value
    });

    const onDownload = useMemoizedFn((event: React.ChangeEvent, info:any):any=>{

        const download = (url: string)=>{ 
            let analysis_a = document.createElement('a')
            document.body.append(analysis_a)
            analysis_a.click();
            url && setTimeout(()=>{
                const newtab: any = window.open(url, '_blank', 'noopener=yes,noreferrer=yes')
                newtab.opener = null; 
            }, 200);
            analysis_a.remove() 
        }

        switch(info.type){
            case '1':
                download(state?.analysis?.url);
                break;
            case '2':
                download(state?.analysis?.cover);
                break;
            case '3':
                download(state?.analysis?.music?.url);
                break; 
        } 
    })
      
    return (
        <div className="main"> 
            <Card title="短视频去水印解析"> 
                <div style={{textAlign:'left', paddingBottom: 12, fontSize: 13}}>
                    <span > 
                        目前支持 皮皮虾/抖音/微视/快手/6间房/哔哩哔哩/微博/绿洲/度小视/开眼/陌陌/皮皮搞笑/全民k歌/逗拍/虎牙/新片场/哔哩哔哩/Acfun/美拍/西瓜视频/火山小视频/网易云Mlog/好看视频/QQ小世界
                        图集解析仅抖音/快手/微博/皮皮虾/最右/皮皮搞笑可用，哔哩哔哩/6间房/微博仅支持下载无法去除水印
                    </span>

                    <p style={{color:'red', fontWeight: 600}}>注意： 个人项目 请勿商用！！！</p> 
                </div>
       
                <Input
                    placeholder="请粘贴分享链接" 
                    before={<Search fontSize="18px" search />} 
                    after={<Button type="text" style={{ borderRadius: 0 }} onClick={onChange}>Search</Button>} 
                    wrapStyle={{ width: '80%', }}
                    style={{ paddingRight: '4rem'}}
                    onChange={onInput}
                    afterClass="btn-search"
                /> 

                <div style={{marginTop: 20}} />

                <div id="tiny-player" style={{maxHeight: 390}} />

                <Group style={{marginTop: 12}}>
                    <Tooltip disabled={!!state?.analysis?.url} label={<div> 没有内容 </div>}>
                        <Button disabled={!state?.analysis?.url} type='1' onClick={onDownload}>下载视频</Button>
                    </Tooltip> 
                    <Tooltip disabled={!!state?.analysis?.cover} label={<div> 没有内容 </div>}>
                        <Button disabled={!state?.analysis?.cover} type='2' onClick={onDownload}>下载封面</Button>
                    </Tooltip> 
                    <Tooltip disabled={!!state?.analysis?.music?.url} label={<div> 没有内容 </div>}>
                        <Button disabled={!state?.analysis?.music.url} type='3' onClick={onDownload}>下载音频</Button>
                    </Tooltip>
                </Group> 
            </Card> 
        </div>
    )
})