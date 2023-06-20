import type { PageServerLoad } from '../[subject_view]/$types';
import { prisma } from '$lib/data/db'
import { redirect } from '@sveltejs/kit';
import { getTime, get_sorted_subjects, get_users_for_select } from '$lib/data/tools';


// 路由0代表是全部主题
export const load = (async ({ params, cookies }) => {

    //* 分别获取用户本人、家庭所有成员、关注成员和该成员所有主题
    const user = await prisma.user.findFirstOrThrow({
        where: {
            id: parseInt(params.userId),
        }
    })
    const users = await prisma.user.findMany({
        where: {
            family_id: user.family_id
        }
    })
    const subjects = await prisma.subject.findMany({
        // 一个User有多个Subject，一个Subject有多个plan
        where: {
            userId: parseInt(params.watching_member)
        }
    })

    //* 如果要显示该成员的所有非隐藏主题
    // 按照日、周、月、年的view分类，只获取自己需要的那一类
    interface Concise_Record { id: number; plan: string; status: string; };
    let concise_record: Concise_Record
    let concise_subjects: { id: number; name: string; show_order: number; record: Concise_Record | null }[] = []
    // 获取关注用户的所有主题中，存储的记录
    for (const subject of subjects) {
        let record
        // 不获取隐藏主题
        if (subject.visible) {
            record = await prisma.plan.findFirst({
                // record的形式如下
                // { id: 1, date: 20230405, view:'day', plan: '看火星娃', status: null, subjectId: 1 }
                where: {
                    subjectId: subject.id,
                    time: params.time,
                    view: params.view
                }
            })
            const id = subject.id
            const name = subject.name
            const show_order = subject.show_order
            if (record) {
                concise_record = {
                    // 添加主题名，以方便显示相关信息
                    id: record.id,
                    plan: record.plan,
                    status: record.status
                };
                concise_subjects.push({ id: id, name: name, show_order: show_order, record: concise_record })
            } else {
                concise_subjects.push({ id: id, name: name, show_order: show_order, record: null })
            }
        }
    }
    return {
        last_date: user.date,
        users: get_users_for_select(users),
        subjects: get_sorted_subjects(concise_subjects),
    }


}
) satisfies PageServerLoad;


/** @type {import('./$types').Actions} */
export const actions = {
    //* 更新日期和视图
    changeView: async ({ request, params }) => {
        const data = await request.formData();
        console.log('................................................................................')
        console.log(data)
        let id, watching_member, view, date, time, subject_view
        if (data.get('date') && data.get('view')) {
            id = parseInt(params.userId)
            view = String(data.get('view'))
            date = parseInt(String(data.get('date')))
            console.log(`parse formDate.......date: ${date}, view: ${view}`)
            await prisma.user.update({
                //TODO 应该修改用户ID的数据，而不是watching_member
                where: { id: id },
                data: {
                    date: date,
                    view: view
                }
            });
            watching_member = params.watching_member
            time = getTime(date, view)
            console.log(`getTime............... time = ${time}`)
            subject_view = params.subject_view
            throw redirect(303, `/${id}/${watching_member}/plan/${view}/${time}/0`)
        } else {
            throw new Error('/userId/plan/view/date/+page.server.ts: can not get date or view')
        }
    },

    //* 更新成员
    changeMember: async ({ request, params }) => {
        const data = await request.formData();
        // console.log(data)
        if (data.get('selected')) {
            // update数据库中用户的watching_member
            const id = parseInt(params.userId)
            const watching_member = parseInt(String(data.get('selected')))
            await prisma.user.update({
                where: { id: id },
                data: {
                    watching_member: watching_member
                }
            });
            // 重定向到该成员的页面
            const view = params.view
            const time = params.time
            const subject_view = params.subject_view
            throw redirect(303, `/${id}/${watching_member}/plan/${view}/${time}/0`)
        } else {
            throw new Error('/userId/plan/view/date/+page.server.ts: can not get selected')
        }
    },

    //* 更新一条plan
    updatePlan: async ({ request, params }) => {
        const data = await request.formData();
        // console.log(data)
        if (data.get('record_id')) {
            const record_id = parseInt(String(data.get('record_id')))
            const plan = String(data.get('plan'))
            await prisma.plan.update({
                where: { id: record_id },
                data: {
                    plan: plan
                }
            });
        } else if (data.get('subject_id')) {
            const subject_id = parseInt(String(data.get('subject_id')))
            const plan = String(data.get('plan'))
            const time = params.time
            const view = params.view
            await prisma.plan.create({
                data: {
                    plan: plan,
                    time: time,
                    view: view,
                    subjectId: subject_id,
                    status: ''
                }
            });
        } else {
            throw new Error('/userId/plan/view/date/+page.server.ts: can not get record_id or subject_id')
        }
    },

    //* 更新一条现状 
    updateStatus: async ({ request, params }) => {
        const data = await request.formData();
        // console.log(data)
        if (data.get('record_id')) {
            const record_id = parseInt(String(data.get('record_id')))
            const status = String(data.get('status'))
            await prisma.plan.update({
                where: { id: record_id },
                data: {
                    status: status
                }
            });
        } else if (data.get('subject_id')) {
            const subject_id = parseInt(String(data.get('subject_id')))
            const status = String(data.get('status'))
            const time = params.time
            const view = params.view
            await prisma.plan.create({
                data: {
                    status: status,
                    time: time,
                    view: view,
                    subjectId: subject_id,
                    plan: ''
                }
            });
        } else {
            throw new Error('/userId/plan/view/date/+page.server.ts: can not get record_id or subject_id')
        }
    }
}