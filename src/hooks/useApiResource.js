import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
export default function useApiResource(path, query='') {
 const [data,setData]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState('');
 const refresh=useCallback(async()=>{setLoading(true);setError('');try{const result=await api(`${path}${query ? `${path.includes('?')?'&':'?'}${query}` : ''}`);setData(result.data ?? result.items ?? result ?? []);}catch(e){setError(e.message);setData([]);}finally{setLoading(false);}},[path,query]);
 useEffect(()=>{refresh();},[refresh]);
 return {data:Array.isArray(data)?data:[],loading,error,refresh,setData};
}
