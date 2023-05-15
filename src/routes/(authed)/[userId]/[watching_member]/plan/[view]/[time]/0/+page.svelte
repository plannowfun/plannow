<script lang="ts">
	import { date, view, time_title } from '$lib/data/stores';
	// import { onMount, beforeUpdate } from 'svelte';
	// import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import dayjs from 'dayjs';

	const now = dayjs();
	export let data;
	// console.log(data.users);
	let user_id = parseInt($page.params.userId);
	date.set(data.last_date);
	view.set($page.params.view);
	// 在data.users中找到当前成员，然后让它的order作为selected
	let selected = data.users.find((u) => u.id === parseInt($page.params.watching_member)).order;
	// 根据selected找到当前用户的id
	let current_user = data.users.find((u) => u.order === selected).id;
	let form;
</script>


<h2>{$time_title}</h2>
<div id="views_and_users" class="sujects pure-g">
	<form class="pure-form" method="POST" action="?/changeView">
		<input type="hidden" name="id" value={user_id} />
		<input type="hidden" name="view" value={$view} />
		<input type="hidden" name="date" value={$date} />
		<input
			type="submit"
			class="pure-button"
			value="今天"
			on:click={() => {
				view.set('day');
				date.set(parseInt(now.format('YYYYMMDD')));
			}}
		/>
		<input class="pure-button" type="submit" value="天" on:click={() => view.set('day')} />
		<input class="pure-button" type="submit" value="周" on:click={() => view.set('week')} />
		<input class="pure-button" type="submit" value="月" on:click={() => view.set('month')} />
		<input class="pure-button" type="submit" value="年" on:click={() => view.set('year')} />
	</form>

	<form class="pure-form" bind:this={form} method="POST" action="?/changeMember">
		<select
			id="select"
			name="selected"
			class="pure-button"
			bind:value={selected}
			on:change={() => form.submit()}
		>
			{#each data.users as u}
				<option value={u.id}>
					{u.name}
				</option>
			{/each}
		</select>
	</form>
</div>

<div class="sujects pure-g">
	{#each data.subjects as s}
		<h3 class="pure-u-2-24">{s.name}</h3>
		<!-- 如果能在subject中找到record，就显示record的plan和status，否则显示空白 -->
		{#if s.record}
			<div class="plan_and_status pure-u-22-24">
				<form class="pure-form" method="POST" action="?/updatePlan">
					<input type="hidden" name="record_id" value={s.record.id} />
					<input type="text" class="pure-u-22-24" name="plan" value={s.record.plan} />
				</form>
				<form class="pure-form" method="POST" action="?/updateStatus">
					<input type="hidden" name="record_id" value={s.record.id} />
					<input type="text" class="pure-u-22-24" name="status" value={s.record.status} />
				</form>
			</div>
		{:else}
			<div class="plan_and_status pure-u-22-24">
				<form class="pure-form" method="POST" action="?/updatePlan">
					<input type="hidden" name="subject_id" value={s.id} />
					<input type="text" class="pure-u-22-24" name="plan" value="" />
				</form>
				<form class="pure-form" method="POST" action="?/updateStatus">
					<input type="hidden" name="subject_id" value={s.id} />
					<input type="text" class="pure-u-22-24" name="status" value="" />
				</form>
			</div>
		{/if}
	{/each}
</div>

<style>
	h2 {
		text-align: center;
	}
	/* .subjects {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
	} */
	select {
		height: 2.5rem;
	}
</style>
