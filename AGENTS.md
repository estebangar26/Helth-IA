<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Los roles se almacenan en `public.user_roles` y se validan tanto en rutas como en funciones de servidor para impedir acceso cruzado.
- Los espacios autenticados principales son `/paciente` y `/medico`; `/panel` se conserva solo como redirección compatible.
