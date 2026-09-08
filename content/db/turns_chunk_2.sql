insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 3, 6, 'B', 'So, is it actually smarter?', '那它真的更聪明了吗？', '[{"word": "actually", "pos": "adv.", "meaning": "实际上；真的"}, {"word": "smarter", "pos": "adj.", "meaning": "更聪明的（smart 的比较级）"}]'::jsonb, '{"title": "一般疑问句 + 比较级", "body": "is it actually smarter? 中 actually 加强求证语气；比较级 smarter 隐含与上一代模型对比。"}'::jsonb, 'audio/turns/t-0006.mp3', 27200, 30248);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 3, 7, 'A', 'OpenAI says it''s their most intelligent, best-aligned model yet.', 'OpenAI 说这是他们迄今最智能、对齐度最高的模型。', '[{"word": "most intelligent", "pos": "adj.", "meaning": "最智能的（intelligent 的最高级）"}, {"word": "best-aligned", "pos": "adj.", "meaning": "对齐度最高的（与人类价值观最一致的）"}, {"word": "yet", "pos": "adv.", "meaning": "迄今；到目前为止"}]'::jsonb, '{"title": "宾语从句 + 双最高级", "body": "says 后接省略 that 的宾语从句；most intelligent 与 best-aligned 并列修饰 model；句末 yet 表“迄今为止”。"}'::jsonb, 'audio/turns/t-0007.mp3', 30668, 35708);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 3, 8, 'B', 'And their president said the AGI era is here?', '他们总裁还说 AGI 时代来了？', '[{"word": "president", "pos": "n.", "meaning": "总裁；董事长"}, {"word": "AGI", "pos": "n.", "meaning": "通用人工智能（artificial general intelligence）"}, {"word": "era", "pos": "n.", "meaning": "时代"}, {"word": "here", "pos": "adv.", "meaning": "到来；出现"}]'::jsonb, '{"title": "said + 宾语从句", "body": "said the AGI era is here 中从句省略 that；从句用一般现在时 is here 表示当前状态。"}'::jsonb, 'audio/turns/t-0008.mp3', 36128, 39992);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 3, 9, 'A', 'Exactly. He even said, "Welcome to the AGI era."', '没错。他甚至说：“欢迎来到 AGI 时代。”', '[{"word": "exactly", "pos": "adv.", "meaning": "正是；没错"}, {"word": "even", "pos": "adv.", "meaning": "甚至"}, {"word": "welcome", "pos": "interj.", "meaning": "欢迎"}]'::jsonb, '{"title": "直接引语", "body": "said, \"Welcome to the AGI era.\" 用直接引语引用原话；Welcome to… 是祈使句，省略主语 you。"}'::jsonb, 'audio/turns/t-0009.mp3', 40412, 46172);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 4, 10, 'B', 'Wait, does everyone buy that?', '等等，大家都相信这种说法吗？', '[{"word": "wait", "pos": "interj.", "meaning": "等等（表停顿/质疑）"}, {"word": "everyone", "pos": "pron.", "meaning": "每个人"}, {"word": "buy", "pos": "v.", "meaning": "相信；买账（口语）"}]'::jsonb, '{"title": "does + 动词原形表疑问", "body": "主语 everyone 为第三人称，用 does 提问，buy 用原形；buy that 是口语“相信那种说法”。"}'::jsonb, 'audio/turns/t-0010.mp3', 46972, 49972);