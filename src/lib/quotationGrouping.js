/** Collapses a flat quotation_items array back into Group → Subgroup → Items, preserving order. */
export function groupQuotationItems(items = []) {
  const groups = [];
  const groupIndex = new Map();

  for (const item of items) {
    const groupName = item.groupName?.trim() || "General";
    const subgroupName = item.subgroupName?.trim() || "";
    let group = groupIndex.get(groupName);
    if (!group) {
      group = { name: groupName, subgroupIndex: new Map(), subgroups: [] };
      groupIndex.set(groupName, group);
      groups.push(group);
    }
    let subgroup = group.subgroupIndex.get(subgroupName);
    if (!subgroup) {
      subgroup = { name: subgroupName, items: [] };
      group.subgroupIndex.set(subgroupName, subgroup);
      group.subgroups.push(subgroup);
    }
    subgroup.items.push(item);
  }

  return groups;
}
