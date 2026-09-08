insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 6, 26, 'B', 'So the listing could land right before the US elections?', '所以上市可能会正好赶在美国中期选举之前？', '[{"word": "listing", "pos": "n.", "meaning": "上市；挂牌"}, {"word": "could", "pos": "modal", "meaning": "可能（can 的过去式/委婉推测）"}, {"word": "land", "pos": "v.", "meaning": "落地；完成"}, {"word": "right before", "pos": "phrase", "meaning": "就在……之前"}, {"word": "election", "pos": "n.", "meaning": "选举"}]'::jsonb, '{"title": "could + 动词原形表推测", "body": "could land 表示对将来的可能推测；right 修饰 before，强调“恰好赶在……之前”。"}'::jsonb, 'audio/turns/t-0026.mp3', 133212, 137628);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 6, 27, 'A', 'Exactly. Some reports say November, just before the midterms.', '正是。有报道说是 11 月，就在中期选举前几天。', '[{"word": "report", "pos": "n.", "meaning": "报道"}, {"word": "November", "pos": "n.", "meaning": "十一月"}, {"word": "just", "pos": "adv.", "meaning": "恰好；正好"}, {"word": "midterm", "pos": "n.", "meaning": "中期选举（常用复数 midterms）"}]'::jsonb, '{"title": "省略的宾语从句", "body": "Some reports say 后省略 that；just before the midterms 表“恰在中期选举之前”。"}'::jsonb, 'audio/turns/t-0027.mp3', 138048, 144192);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, NULL, 28, 'B', 'Wild week. Thanks for the update!', '真是疯狂的一周。谢谢你的更新！', '[{"word": "wild", "pos": "adj.", "meaning": "疯狂的；令人惊叹的（口语）"}, {"word": "thanks", "pos": "n.", "meaning": "感谢"}, {"word": "update", "pos": "n.", "meaning": "更新；最新消息"}]'::jsonb, '{"title": "省略句 + Thanks for…", "body": "Wild week. 是 It was a wild week. 的省略；Thanks for the update. 表示“谢谢告知最新消息”。"}'::jsonb, 'audio/turns/t-0028.mp3', 144992, 149240);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, NULL, 29, 'A', 'Anytime. Want the article links?', '不客气。要文章链接吗？', '[{"word": "anytime", "pos": "adv.", "meaning": "随时；不客气（口语）"}, {"word": "article", "pos": "n.", "meaning": "文章"}, {"word": "link", "pos": "n.", "meaning": "链接"}]'::jsonb, '{"title": "口语省略问句", "body": "Want the article links? 是 Do you want the article links? 的省略，口语中很常见。"}'::jsonb, 'audio/turns/t-0029.mp3', 149660, 154172);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, NULL, 30, 'B', 'Yes, please. I''ll read them tonight.', '好的，谢谢！我今晚就读。', '[{"word": "please", "pos": "interj.", "meaning": "请；好啊（表同意）"}, {"word": "read", "pos": "v.", "meaning": "阅读（read-read-read 不规则动词）"}, {"word": "tonight", "pos": "adv.", "meaning": "今晚"}]'::jsonb, '{"title": "I''ll = I will 表将来", "body": "I''ll read them tonight. 用一般将来时表今晚的打算；them 指代前面的 article links。"}'::jsonb, 'audio/turns/t-0030.mp3', 154592, 159152);