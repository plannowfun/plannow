import type { PageServerLoad } from '../[subject_view]/$types';
import { prisma } from '$lib/data/db'
import { redirect } from '@sveltejs/kit';
import { getTime, get_sorted_subjects, get_users_for_select } from '$lib/data/tools';


export const load = (async ({ params, cookies }) => {

    //* 分别获取用户本人、关注成员、家庭所有成员、该成员所有主题
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
    let concise_record: { id: number; plan: string; status: string; };
    let concise_subjects: { id: number, name: string, show_order: number }[] = []
    // 获取该主题下，该用户的记录
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
    //* 只显示单一非隐藏主题
    // 确定要显示的单一主题是什么，有params.subject_view

    // 获取该成员在该视图、时间下的所有主题plan内容
    // 如果view是天，不显示总结。否则添加周、月、年总结status。但是周的现状不就是周总结吗。
    // 显示天计划、天现状
    // 也就是视图是周，仅显示本周的所有天plan和status
    // 显示周计划、周现状，显示本周所有天的plan和status
    // 视图是月，仅显示本月的所有重叠周的plan和status（难度稍高）
    // 显示月计划、月现状，显示本月所有周的plan和status
    // 视图是年，仅显示本年的所有月的plan和status
    // 显示年计划、年现状，显示本年所有月的plan和status

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
        console.log(data)
        let id, watching_member, view, date, time, subject_view
        if (data.get('date') && data.get('view')) {
            id = parseInt(params.userId)
            view = String(data.get('view'))
            date = parseInt(String(data.get('date')))
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
            subject_view = params.subject_view
            throw redirect(303, `/${id}/${watching_member}/plan/${view}/${time}/${subject_view}`)
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
            throw redirect(303, `/${id}/${watching_member}/plan/${view}/${time}/${subject_view}`)
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