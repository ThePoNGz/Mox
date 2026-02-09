-- Add token tracking columns to ai_logs table
alter table public.ai_logs 
  add column if not exists input_tokens int,
  add column if not exists output_tokens int,
  add column if not exists total_tokens int;

-- Add comment for documentation
comment on column public.ai_logs.input_tokens is 'Number of tokens in the prompt sent to the AI';
comment on column public.ai_logs.output_tokens is 'Number of tokens in the AI response';
comment on column public.ai_logs.total_tokens is 'Total tokens used (input + output)';
