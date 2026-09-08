insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 5, 21, 'A', 'Right. IT Home says it''s a big step for AI PCs.', '对。IT之家说这是 AI PC 的一大步。', '[{"word": "IT Home", "pos": "n.", "meaning": "IT之家（科技媒体）"}, {"word": "step", "pos": "n.", "meaning": "一步；进展"}, {"word": "AI PC", "pos": "n.", "meaning": "AI 个人电脑"}]'::jsonb, '{"title": "says + 宾语从句", "body": "says 后接省略 that 的宾语从句；a big step for… 意为“对……而言的重大进展”。"}'::jsonb, 'audio/turns/t-0021.mp3', 104144, 109784);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, NULL, 22, 'B', 'Nice. What about the business news?', '不错。那商业方面的新闻呢？', '[{"word": "nice", "pos": "adj.", "meaning": "不错；好"}, {"word": "business", "pos": "n.", "meaning": "商业；企业"}, {"word": "news", "pos": "n.", "meaning": "新闻"}]'::jsonb, '{"title": "What about…?", "body": "What about the business news? 用于转换话题，意为“那……方面呢？”。"}'::jsonb, 'audio/turns/t-0022.mp3', 110584, 114904);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 6, 23, 'A', 'Anthropic delayed its IPO. The roadshow now starts in mid-October.', 'Anthropic 推迟了 IPO。路演现在要 10 月中旬才开始。', '[{"word": "Anthropic", "pos": "n.", "meaning": "Anthropic（AI 公司，Claude 开发商）"}, {"word": "delay", "pos": "v.", "meaning": "推迟"}, {"word": "IPO", "pos": "n.", "meaning": "首次公开募股（initial public offering）"}, {"word": "roadshow", "pos": "n.", "meaning": "路演（IPO 推介活动）"}, {"word": "mid-October", "pos": "n.", "meaning": "十月中旬"}]'::jsonb, '{"title": "过去时 + in + 时间段", "body": "delayed 用一般过去时；in mid-October 表示“在十月中旬”，用于将来的时间点。"}'::jsonb, 'audio/turns/t-0023.mp3', 115704, 122160);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 6, 24, 'B', 'Why though? I thought it was the hottest IPO ever.', '可为什么呢？我本以为这是史上最热门的 IPO。', '[{"word": "thought", "pos": "v.", "meaning": "原以为（think 的过去式）"}, {"word": "hottest", "pos": "adj.", "meaning": "最热门的（hot 的最高级）"}, {"word": "ever", "pos": "adv.", "meaning": "有史以来"}]'::jsonb, '{"title": "I thought… 表原以为", "body": "I thought it was… 用过去式表示“我原本以为”，暗示现在想法有变；最高级 hottest + ever 表“史上最……”。"}'::jsonb, 'audio/turns/t-0024.mp3', 122580, 127716);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 6, 25, 'A', 'Cailian Press says even the filing may slip to late September.', '财联社说连招股书都可能推迟到 9 月下旬。', '[{"word": "Cailian Press", "pos": "n.", "meaning": "财联社（财经媒体）"}, {"word": "filing", "pos": "n.", "meaning": "（IPO）招股说明书提交"}, {"word": "slip", "pos": "v.", "meaning": "滑后；推迟（口语）"}, {"word": "late September", "pos": "n.", "meaning": "九月下旬"}]'::jsonb, '{"title": "may + 动词原形表可能", "body": "says 后接宾语从句；may slip 表“可能推迟”；even 强调“连招股书都……”。"}'::jsonb, 'audio/turns/t-0025.mp3', 128136, 132792);