insert into boards (slug, name, icon, is_open, display_order) values
  ('beauty', '美容・コーデ', '💄', true, 1),
  ('chat', '雑談', '🍵', true, 2),
  ('oshi', '推し活', '🎤', false, 3),
  ('game', 'ゲーム', '🎮', false, 4),
  ('work', '仕事・副業', '💼', false, 5)
on conflict (slug) do nothing;
insert into notices (body) values
  ('広場はテスト公開中です。投稿は24時間で表示から消えます。')
;
insert into threads (board_id, title, starter_name)
select id, '今日の銀座、風と乾燥の日のまとめ髪', 'みさき' from boards where slug = 'beauty';
insert into threads (board_id, title, starter_name)
select id, '乾燥の日に効いたリップケア', 'あおい' from boards where slug = 'beauty';
insert into threads (board_id, title, starter_name)
select id, '駅前の新しいパン屋の話', 'ゆい' from boards where slug = 'chat';
insert into posts (thread_id, author_name, body, kind, expires_at)
select t.id, 'みさき', '今日の銀座、風が強くて髪が散ります。まとめ髪にするなら、この時間の美容室まだ空いてる所あります', 'info', now() + interval '50 minutes'
from threads t join boards b on b.id = t.board_id where b.slug = 'beauty' and t.title like '今日の銀座%';
insert into posts (thread_id, author_name, body, kind, expires_at)
select t.id, 'あおい', '乾燥でリップが荒れる日。今日効いたケアを置いておきます', 'info', now() + interval '2 hours 40 minutes'
from threads t join boards b on b.id = t.board_id where b.slug = 'beauty' and t.title like '乾燥の日%';
insert into posts (thread_id, author_name, body, kind, expires_at)
select t.id, 'ゆい', '駅前の新しいパン屋、午前で売り切れるらしいです。行った人いますか', 'ask', now() + interval '20 hours'
from threads t join boards b on b.id = t.board_id where b.slug = 'chat';
