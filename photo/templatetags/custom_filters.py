from django import template
import os

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

@register.filter
def dirname(path):
    """Возвращает имя родительской директории."""
    return os.path.dirname(path)