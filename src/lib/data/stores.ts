import { writable, derived } from "svelte/store";
import { getTime, getTimeTitle } from './tools'


export const date = writable(20230101);
export const view = writable('day');
export const time = derived([date, view], ([$date, $view]) => getTime($date, $view))
export const time_title = derived([date, view], ([$date, $view]) => getTimeTitle($date, $view))
