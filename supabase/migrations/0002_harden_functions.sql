alter function public.is_admin() set search_path = '';
-- Only the auth trigger needs this; nobody should call it through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
