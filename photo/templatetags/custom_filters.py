from django import template

register = template.Library()

@register.filter
def get(dictionary, key):
    return dictionary.get(key)


@register.filter
def parent_directory(path):
    """
    Возвращает родительский путь директории.
    """
    if '/' not in path:
        return ''
    return '/'.join(path.split('/')[:-1])