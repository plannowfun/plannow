import type { User } from '@prisma/client';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'


dayjs.extend(weekOfYear)
export function getTime(date: number, view: string) {
    const time = dayjs(String(date), 'YYYYMMDD')
    if (view === 'day') {
        return String(date)
    } else if (view === 'week') {
        return `${time.year()}${time.week()}`
    } else if (view === 'month') {
        return `${time.year()}${time.month()}`
    } else if (view === 'year') {
        return `${time.year()}`
    } else {
        console.log(`the value of view is ${JSON.stringify(view)}`)
        throw new Error('unkown view value')
    }
}
export function getTimeTitle(date: number, view: string) {
    const time = dayjs(String(date), 'YYYYMMDD')
    if (view === 'day') {
        return time.format('YYYY年M月D日');
    } else if (view === 'week') {
        return `${time.year()}年第${time.week() + 1}周`
    } else if (view === 'month') {
        return `${time.year()}年${time.month() + 1}月`
    } else if (view === 'year') {
        return `${time.year()}年`
    } else {
        console.log(`the value of view is ${JSON.stringify(view)}`)
        throw new Error('unkown view value')
    }
}

export function getDate(view:string, time:string){
    if (view === 'day') {
        return parseInt(time)
    } else if (view === 'week') {
        // 如果time是202301，那么就是2023年的第一周，返回2023年的第一周的第一天
        // 如果time是202252，那么就是2022年的第52周，返回2022年的第52周的第一天
        return dayjs(time, 'YYYYWW').week(parseInt(time.slice(4))).day(0).format('YYYYMMDD')
    } else if (view === 'month') {
        // 如果time是202301，那么就是2023年的第一月，返回2023年的第一月的第一天
        // 如果time是202212，那么就是2022年的第12月，返回2022年的第12月的第一天
        return dayjs(time, 'YYYYMM').month(parseInt(time.slice(4))).date(1).format('YYYYMMDD')
    } else if (view === 'year') {
        // 如果time是2023，那么就是2023年，返回2023年的第一天
        // 如果time是2022，那么就是2022年，返回2022年的第一天
        return dayjs(time, 'YYYY').year(parseInt(time)).dayOfYear(1).format('YYYYMMDD')
    } else {
        console.log(`the value of view is ${JSON.stringify(view)}`)
        throw new Error('unkown view value')
    }
}

export function get_users_for_select(users: User[]) {
    // 只保留id和name，并且每一项增加一个order属性，从0开始
    let users_for_select = users.map((user, index) => {
        return {
            id: user.id,
            name: user.name,
            order: index +1 
        }
    })
    return users_for_select
}

export function get_sorted_subjects(subjects: { id: number, name: string, show_order: number, record: { id: number, plan: string, status: string } | null }[]) {
    let sorted_sujects = subjects.sort((a, b) => a.show_order - b.show_order)
    return sorted_sujects.map(subject => {
        return {
            id: subject.id,
            name: subject.name,
            record: subject.record
        }
    }
    )
}