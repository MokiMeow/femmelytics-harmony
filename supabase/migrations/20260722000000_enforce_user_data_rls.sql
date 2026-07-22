-- Femmelytics stores sensitive health information. Keep every user-owned row
-- scoped to the authenticated user even when requests bypass the web client.

alter table public.article_bookmarks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.cycle_entries enable row level security;
alter table public.cycle_statistics enable row level security;
alter table public.feedback enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_likes enable row level security;
alter table public.forum_posts enable row level security;
alter table public.health_articles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.medication_history enable row level security;
alter table public.medications enable row level security;
alter table public.mood_entries enable row level security;
alter table public.profiles enable row level security;
alter table public.symptom_entries enable row level security;

-- RLS policies are permissive by default: one stale `using (true)` policy can
-- bypass every restrictive owner policy added below. Replace the policy set on
-- these application tables so this migration is authoritative.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'article_bookmarks', 'chat_sessions', 'cycle_entries',
        'cycle_statistics', 'feedback', 'forum_comments', 'forum_likes',
        'forum_posts', 'health_articles', 'journal_entries',
        'medication_history', 'medications', 'mood_entries', 'profiles',
        'symptom_entries'
      ])
  loop
    execute format(
      'drop policy %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end
$$;

create policy "femmelytics_bookmarks_select_own" on public.article_bookmarks for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_bookmarks_insert_own" on public.article_bookmarks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_bookmarks_delete_own" on public.article_bookmarks for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_chat_select_own" on public.chat_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_chat_insert_own" on public.chat_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_chat_update_own" on public.chat_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_chat_delete_own" on public.chat_sessions for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_cycle_entries_select_own" on public.cycle_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_cycle_entries_insert_own" on public.cycle_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_cycle_entries_update_own" on public.cycle_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_cycle_entries_delete_own" on public.cycle_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_cycle_stats_select_own" on public.cycle_statistics for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_cycle_stats_insert_own" on public.cycle_statistics for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_cycle_stats_update_own" on public.cycle_statistics for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_cycle_stats_delete_own" on public.cycle_statistics for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_feedback_select_own" on public.feedback for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_feedback_insert_own" on public.feedback for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "femmelytics_forum_posts_read_members" on public.forum_posts for select to authenticated using (true);
create policy "femmelytics_forum_posts_insert_own" on public.forum_posts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_forum_posts_update_own" on public.forum_posts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_forum_posts_delete_own" on public.forum_posts for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_forum_comments_read_members" on public.forum_comments for select to authenticated using (true);
create policy "femmelytics_forum_comments_insert_own" on public.forum_comments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_forum_comments_update_own" on public.forum_comments for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_forum_comments_delete_own" on public.forum_comments for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_forum_likes_read_members" on public.forum_likes for select to authenticated using (true);
create policy "femmelytics_forum_likes_insert_own" on public.forum_likes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_forum_likes_delete_own" on public.forum_likes for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_articles_read_members" on public.health_articles for select to authenticated using (true);

create policy "femmelytics_journal_select_own" on public.journal_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_journal_insert_own" on public.journal_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_journal_update_own" on public.journal_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_journal_delete_own" on public.journal_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_medications_select_own" on public.medications for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_medications_insert_own" on public.medications for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_medications_update_own" on public.medications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_medications_delete_own" on public.medications for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_med_history_select_own" on public.medication_history for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_med_history_insert_own" on public.medication_history for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_med_history_update_own" on public.medication_history for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_med_history_delete_own" on public.medication_history for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_mood_select_own" on public.mood_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_mood_insert_own" on public.mood_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_mood_update_own" on public.mood_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_mood_delete_own" on public.mood_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "femmelytics_profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "femmelytics_profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "femmelytics_profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "femmelytics_symptoms_select_own" on public.symptom_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "femmelytics_symptoms_insert_own" on public.symptom_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "femmelytics_symptoms_update_own" on public.symptom_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "femmelytics_symptoms_delete_own" on public.symptom_entries for delete to authenticated using ((select auth.uid()) = user_id);
