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