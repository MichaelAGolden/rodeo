<script lang="ts">
	import type { Announcement } from '@prisma/client';

	export let announcements: Announcement[];
</script>

{#if announcements.length > 0}
	<ul>
		{#each announcements as announcement}
			<li>
				<p>
					{announcement.published.toLocaleTimeString('en-us', {
						hour: 'numeric',
						minute: 'numeric',
					})}
					on
					{announcement.published.toLocaleDateString('en-us', {
						month: 'long',
						day: 'numeric',
					})}
				</p>
				<br />
				<p>{announcement.body}</p>
			</li>
		{/each}
	</ul>
{:else}
	<p>There are no announcements at this time.</p>
	<br />
{/if}

<style>
	ul {
		list-style: none;
		padding-left: 0;
	}

	li {
		border: 2px solid black;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	p {
		margin: 0;
	}
</style>