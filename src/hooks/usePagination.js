


import { useMemo,  useState } from 'react'; 
import { useMemoizedFn } from  '@/hooks/useMemoize'

export function useUncontrolled({ value, init, final, onChange = () => {} }) {
	const [state, setState] = useState(init !== undefined ? init : final);

	const handleChange = (val) => {
		setState(val);
		onChange?.(val);
	};

	if (value !== undefined) {
		return [value, onChange, true];
	};

	return [state, handleChange, false];
}

 
export function usePagination(props) {
	const { total, siblings = 1, boundaries = 1, page, init = 1, onChange } = props
	const [_total, DOTS] = useMemo(()=>[Math.max(Math.trunc(total), 0),'dots'],[total]);
    const [active, setActive] = useUncontrolled({ value: page, onChange, init: init, final: init });

	const ranges = useMemoizedFn((start, end)=>{
		const length = end - start + 1;
        return Array.from({ length }, (_, index) => index + start);
	});

	const pageFunc = useMemo(()=>{
		const setPage = (page) =>{
			page <= 0 && setActive(1);
			page > _total && setActive(_total);
			page <= _total && page > 0 && setActive(page)
		}

		return {
			page:setPage,
			first:()=>setPage(1),
			last:()=>setPage(_total),

			next:()=>setPage(active + 1),
			prev:()=>setPage(active - 1),
		}
	},[_total, active])


    const range = useMemo(() => {
		const totals = siblings * 2 + 3 + boundaries * 2;
		if (totals >= _total) {
			return ranges(1, _total);
		};

		const leftIndex = Math.max(active - siblings, boundaries);
		const rightIndex = Math.min(active + siblings, _total - boundaries);
		const showLeftDots = leftIndex > boundaries + 2;
		const showRightDots = rightIndex < _total - (boundaries + 1);

		if (!showLeftDots && showRightDots) {
			const leftItem = siblings * 2 + boundaries + 2;
			return [...ranges(1, leftItem), DOTS, ...ranges(_total - (boundaries - 1), _total)];
		};

		if (showLeftDots && !showRightDots) {
			const rightItemCount = boundaries + 1 + 2 * siblings;
			return [...ranges(1, boundaries), DOTS, ...ranges(_total - rightItemCount, _total)];
		};

		return [
			...ranges(1, boundaries),
			DOTS,
			...ranges(leftIndex, rightIndex),
			DOTS,
			...ranges(_total - boundaries + 1, _total)
		]
    }, [_total, siblings, active]);

    return { range, active, ...pageFunc }
}