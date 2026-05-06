REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, service_role;